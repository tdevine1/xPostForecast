<#
.SYNOPSIS
Creates an Azure Static Web App (the frontend) in each group's resource group.

.DESCRIPTION
For each resource group, creates a Static Web App named <resource group, lower case>-frontend.
The apps are created without a connected repository: each team links their own repository or
deploys with their own workflow.

The default plan is Free. Standard is a paid plan, so it is only used when you ask for it.

Requires the Az PowerShell module (Az.Accounts, Az.Resources, Az.Websites).

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

.PARAMETER Location
Region for the Static Web App resource. Default eastus2.

.PARAMETER SkuName
Free or Standard. Default Free.

.EXAMPLE
.\New-GroupStaticWebApps.ps1 -Semester 202608 -Crn 84715 -LastGroup 10 -WhatIf
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory, ParameterSetName = 'Numbered')] [string] $Semester,
    [Parameter(Mandatory, ParameterSetName = 'Numbered')] [string] $Crn,
    [Parameter(ParameterSetName = 'Numbered')] [string] $Section = '001',
    [Parameter(ParameterSetName = 'Numbered')] [int] $FirstGroup = 1,
    [Parameter(Mandatory, ParameterSetName = 'Numbered')] [int] $LastGroup,
    [Parameter(Mandatory, ParameterSetName = 'Named')] [string[]] $ResourceGroupName,
    [string] $Location = 'eastus2',
    [ValidateSet('Free', 'Standard')] [string] $SkuName = 'Free'
)

Import-Module Az.Websites
if (-not (Get-AzContext)) { Connect-AzAccount | Out-Null }

if ($PSCmdlet.ParameterSetName -eq 'Named') {
    $groups = $ResourceGroupName
} else {
    $groups = $FirstGroup..$LastGroup | ForEach-Object {
        '{0}-CS330-{1}-{2}-Group{3:D2}' -f $Semester, $Section, $Crn, $_
    }
}

foreach ($resourceGroup in $groups) {
    if (-not (Get-AzResourceGroup -Name $resourceGroup -ErrorAction SilentlyContinue)) {
        Write-Warning "Resource group $resourceGroup does not exist. Skipping."
        continue
    }

    $appName = $resourceGroup.ToLower() + '-frontend'

    if ($PSCmdlet.ShouldProcess($appName, "Create $SkuName Static Web App in $resourceGroup")) {
        Write-Output "Creating Static Web App '$appName' ($SkuName) in '$resourceGroup'..."
        New-AzStaticWebApp -ResourceGroupName $resourceGroup `
            -Name $appName `
            -Location $Location `
            -SkuName $SkuName `
            -ErrorAction Stop
        Write-Output "Created '$appName'."
    }
}
