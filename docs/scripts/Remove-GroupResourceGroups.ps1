<#
.SYNOPSIS
Deletes a semester's resource groups, and EVERYTHING inside them, after a typed confirmation.

.DESCRIPTION
At the end of a semester the class's Azure resources are removed so they stop costing money.
This script does that for every group at once.

What "everything" means: a resource group is a folder that holds a team's Azure resources. When a
resource group is deleted, every resource inside it is deleted with it: the MySQL server and all of its
databases and data, the App Service plan, the web app, the Static Web App, and anything a student added.
The resource group itself is deleted too, so Statler ITS has to create it again next semester.
Deleting cannot be undone.

The script is built to be hard to run by accident:
  1. Nothing is hardcoded. You must say which semester and CRN.
  2. It builds the names <Semester>-CS330-<Section>-<Crn>-GroupNN for the range you give, plus the
     <Semester>-CS330-<Section>-<Crn>-DEMO group (leave it out with -ExcludeDemo).
  3. It prints every resource group that exists and every resource inside it, by name and type.
  4. It asks you to type the semester code before deleting anything.
  5. -WhatIf prints what would be deleted and deletes nothing. Run that first.

Requires the Az PowerShell module (Az.Accounts, Az.Resources).

.PARAMETER Semester
Six-digit term code, for example 202608.

.PARAMETER Crn
Course reference number, for example 84715.

.PARAMETER Section
Section number. Default 001.

.PARAMETER FirstGroup
First group number. Default 1.

.PARAMETER LastGroup
Last group number.

.PARAMETER ExcludeDemo
Keep the DEMO resource group. By default it is deleted along with the team groups.

.EXAMPLE
.\Remove-GroupResourceGroups.ps1 -Semester 202608 -Crn 84715 -LastGroup 10 -WhatIf
Shows everything that would be deleted, including the demo group, and deletes nothing.

.EXAMPLE
.\Remove-GroupResourceGroups.ps1 -Semester 202608 -Crn 84715 -LastGroup 10
Deletes groups 1 to 10 and the demo group after you type 202608.

.EXAMPLE
.\Remove-GroupResourceGroups.ps1 -Semester 202608 -Crn 84715 -FirstGroup 7 -LastGroup 10 -ExcludeDemo
Deletes only groups 7 to 10.
#>
[CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'High')]
param(
    [Parameter(Mandatory)] [ValidatePattern('^\d{6}$')] [string] $Semester,
    [Parameter(Mandatory)] [string] $Crn,
    [string] $Section = '001',
    [int] $FirstGroup = 1,
    [Parameter(Mandatory)] [int] $LastGroup,
    [switch] $ExcludeDemo
)

if (-not (Get-AzContext)) { Connect-AzAccount | Out-Null }

$names = @($FirstGroup..$LastGroup | ForEach-Object {
    '{0}-CS330-{1}-{2}-Group{3:D2}' -f $Semester, $Section, $Crn, $_
})
if (-not $ExcludeDemo) { $names += ('{0}-CS330-{1}-{2}-DEMO' -f $Semester, $Section, $Crn) }

$existing = @()
$totalResources = 0
foreach ($name in $names) {
    $group = Get-AzResourceGroup -Name $name -ErrorAction SilentlyContinue
    if (-not $group) {
        Write-Warning "$name does not exist. Skipping."
        continue
    }

    $resources = @(Get-AzResource -ResourceGroupName $name)
    $totalResources += $resources.Count
    Write-Output ''
    Write-Output ('{0}  ({1} resources)' -f $name, $resources.Count)
    foreach ($resource in $resources) {
        Write-Output ('    {0}   [{1}]' -f $resource.Name, $resource.ResourceType)
    }
    $existing += $name
}

if ($existing.Count -eq 0) { Write-Output 'Nothing to delete.'; return }

Write-Output ''
Write-Output ('{0} resource groups holding {1} resources will be deleted.' -f $existing.Count, $totalResources)

if (-not $WhatIfPreference) {
    $answer = Read-Host "Type $Semester to permanently delete all of the above"
    if ($answer -ne $Semester) { Write-Output 'Confirmation did not match. Nothing was deleted.'; return }
}

foreach ($name in $existing) {
    if ($PSCmdlet.ShouldProcess($name, 'Delete resource group and all of its resources')) {
        try {
            Remove-AzResourceGroup -Name $name -Force -ErrorAction Stop | Out-Null
            Write-Host "Deleted $name" -ForegroundColor Green
        } catch {
            Write-Host "Failed to delete ${name}: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host 'All specified resource groups processed.' -ForegroundColor Cyan
Write-Host 'Next: set DEPLOY_TO_AZURE to false in the reference repository and delete its Azure secrets.' -ForegroundColor Cyan
