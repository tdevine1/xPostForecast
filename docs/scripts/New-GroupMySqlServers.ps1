<#
.SYNOPSIS
Creates one Azure Database for MySQL Flexible Server in each group's resource group.

.DESCRIPTION
For every group number from -FirstGroup to -LastGroup, finds the resource group
<Semester>-CS330-<Section>-<Crn>-GroupNN and creates a server named
<that resource group in lower case>-mysql-db inside it. Groups whose resource group
does not exist are skipped with a warning.

The administrator password is never stored in this file. You are prompted for it
(typing is hidden), or you can pass -AdminPassword as a SecureString. Use a new password
every semester and do not build it from a pattern.

Requires the Az PowerShell module (Az.Accounts, Az.Resources, Az.MySql).

.PARAMETER Semester
Term code used in the resource group names, for example 202608.

.PARAMETER Crn
Course reference number used in the resource group names, for example 84715.

.PARAMETER Section
Section number used in the resource group names. Default 001.

.PARAMETER FirstGroup
First group number to create. Default 1.

.PARAMETER LastGroup
Last group number to create.

.PARAMETER Location
Azure region. Use the same region as the backend App Service. Default eastus.

.PARAMETER Sku
Server size. Default Standard_B1ms (burstable, the smallest general-purpose choice).

.PARAMETER AdminLogin
Administrator user name. Default mysqladmin.

.EXAMPLE
.\New-GroupMySqlServers.ps1 -Semester 202608 -Crn 84715 -LastGroup 10 -WhatIf
Shows which servers would be created without creating anything.

.EXAMPLE
.\New-GroupMySqlServers.ps1 -Semester 202608 -Crn 84715 -FirstGroup 6 -LastGroup 8
Creates servers for groups 6, 7, and 8 only (prompts for the password).
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)] [string] $Semester,
    [Parameter(Mandatory)] [string] $Crn,
    [string] $Section = '001',
    [int] $FirstGroup = 1,
    [Parameter(Mandatory)] [int] $LastGroup,
    [string] $Location = 'eastus',
    [string] $Sku = 'Standard_B1ms',
    [string] $AdminLogin = 'mysqladmin',
    [securestring] $AdminPassword
)

if (-not (Get-AzContext)) { Connect-AzAccount | Out-Null }

if (-not $AdminPassword -and -not $WhatIfPreference) {
    $AdminPassword = Read-Host -Prompt 'MySQL administrator password for every group server' -AsSecureString
}

foreach ($i in $FirstGroup..$LastGroup) {
    $resourceGroup = '{0}-CS330-{1}-{2}-Group{3:D2}' -f $Semester, $Section, $Crn, $i

    if (-not (Get-AzResourceGroup -Name $resourceGroup -ErrorAction SilentlyContinue)) {
        Write-Warning "Resource group $resourceGroup does not exist. Skipping."
        continue
    }

    $serverName = $resourceGroup.ToLower() + '-mysql-db'

    if ($PSCmdlet.ShouldProcess($serverName, "Create MySQL Flexible Server in $resourceGroup")) {
        Write-Output "Creating MySQL Flexible Server '$serverName' in '$resourceGroup'..."
        New-AzMySqlFlexibleServer -ResourceGroupName $resourceGroup `
            -Name $serverName `
            -Location $Location `
            -Sku $Sku `
            -AdministratorUserName $AdminLogin `
            -AdministratorLoginPassword $AdminPassword
        Write-Output "Created '$serverName'."
    }
}

Write-Output 'Done. Next for each server: allow access from Azure services, add student IPs, create the authdb database and schema (see the Deployment Steps page).'
