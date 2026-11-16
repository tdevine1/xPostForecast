<#
.SYNOPSIS
Creates a Linux App Service plan and a Node.js web app (the backend) for each group.

.DESCRIPTION
Uses the Azure CLI (az). For each resource group it:
  1. creates a Linux App Service plan named <resource group, lower case>-plan (skipped when -PlanName is given),
  2. creates a web app named <resource group, lower case>-backend on that plan,
  3. turns on SCM basic-auth publishing credentials, which is what makes
     "Download publish profile" available in the portal (new apps have it off).

Apps created this way get a plain host name, <name>.azurewebsites.net. The Azure portal's create form
adds a random suffix to the host name instead.

Two separate sign-ins are involved: Connect-AzAccount signs in Az PowerShell, but this script
calls the Azure CLI, which needs its own "az login". The script runs "az login" for you if needed.

Select the right subscription first:  az account set --subscription "<name or id>"

.PARAMETER Semester
Term code used in the resource group names, for example 202608 (numbered groups).

.PARAMETER Crn
Course reference number, for example 84715 (numbered groups).

.PARAMETER Section
Section number. Default 001 (numbered groups).

.PARAMETER FirstGroup
First group number. Default 1 (numbered groups).

.PARAMETER LastGroup
Last group number (numbered groups).

.PARAMETER ResourceGroupName
One or more resource group names to use instead of numbered groups, for example the demo group.

.PARAMETER PlanName
Use this existing App Service plan instead of creating one (it must be in the same region).

.PARAMETER Location
Azure region. Default eastus.

.PARAMETER Sku
App Service plan size. Default B1 (the cheapest Basic tier).

.PARAMETER Runtime
Runtime stack. Default NODE:24-lts. List the current choices with:  az webapp list-runtimes --os linux

.EXAMPLE
.\New-GroupAppServices.ps1 -Semester 202608 -Crn 84715 -LastGroup 10 -WhatIf

.EXAMPLE
.\New-GroupAppServices.ps1 -ResourceGroupName 202608-CS330-001-84715-DEMO -PlanName ASP-example -WhatIf
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory, ParameterSetName = 'Numbered')] [string] $Semester,
    [Parameter(Mandatory, ParameterSetName = 'Numbered')] [string] $Crn,
    [Parameter(ParameterSetName = 'Numbered')] [string] $Section = '001',
    [Parameter(ParameterSetName = 'Numbered')] [int] $FirstGroup = 1,
    [Parameter(Mandatory, ParameterSetName = 'Numbered')] [int] $LastGroup,
    [Parameter(Mandatory, ParameterSetName = 'Named')] [string[]] $ResourceGroupName,
    [string] $PlanName,
    [string] $Location = 'eastus',
    [string] $Sku = 'B1',
    [string] $Runtime = 'NODE:24-lts'
)

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    throw 'The Azure CLI (az) is not installed. Install it from https://learn.microsoft.com/cli/azure/install-azure-cli'
}

az account show --query id --output tsv 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { az login --output none }

if ($PSCmdlet.ParameterSetName -eq 'Named') {
    $groups = $ResourceGroupName
} else {
    $groups = $FirstGroup..$LastGroup | ForEach-Object {
        '{0}-CS330-{1}-{2}-Group{3:D2}' -f $Semester, $Section, $Crn, $_
    }
}

foreach ($resourceGroup in $groups) {
    if ((az group exists --name $resourceGroup) -ne 'true') {
        Write-Warning "Resource group $resourceGroup does not exist. Skipping."
        continue
    }

    $plan = if ($PlanName) { $PlanName } else { $resourceGroup.ToLower() + '-plan' }
    $app  = $resourceGroup.ToLower() + '-backend'

    if (-not $PSCmdlet.ShouldProcess($app, "Create web app ($Runtime, plan $plan) in $resourceGroup")) { continue }

    if (-not $PlanName) {
        Write-Output "Creating plan '$plan' ($Sku) in '$resourceGroup'..."
        az appservice plan create --resource-group $resourceGroup --name $plan --is-linux --sku $Sku --location $Location --output none
        if ($LASTEXITCODE -ne 0) { Write-Error "Could not create plan $plan."; continue }
    }

    Write-Output "Creating web app '$app'..."
    az webapp create --resource-group $resourceGroup --plan $plan --name $app --runtime $Runtime --output none
    if ($LASTEXITCODE -ne 0) { Write-Error "Could not create web app $app."; continue }

    Write-Output 'Turning on SCM basic-auth publishing credentials...'
    az resource update --resource-group $resourceGroup --namespace Microsoft.Web `
        --resource-type basicPublishingCredentialsPolicies --parent "sites/$app" --name scm `
        --set properties.allow=true --output none
    if ($LASTEXITCODE -ne 0) { Write-Warning "Could not enable basic auth on $app." }

    Write-Output "Done: https://$app.azurewebsites.net"
}
