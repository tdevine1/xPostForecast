<#
.SYNOPSIS
Deletes a semester's group resource groups, and everything inside them, after a typed confirmation.

.DESCRIPTION
Builds the names <Semester>-CS330-<Section>-<Crn>-GroupNN for the range you give, shows each
resource group that exists and how many resources it holds, then asks you to type the semester code
before deleting anything. Deleting a resource group cannot be undone.

Nothing is hardcoded: you must say which semester and CRN. The demo resource group
(<Semester>-CS330-<Section>-<Crn>-DEMO) is only included with -IncludeDemo.

Use -WhatIf first to see what would be deleted without deleting it.

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

.PARAMETER IncludeDemo
Also delete the DEMO resource group.

.EXAMPLE
.\Remove-GroupResourceGroups.ps1 -Semester 202608 -Crn 84715 -LastGroup 11 -WhatIf

.EXAMPLE
.\Remove-GroupResourceGroups.ps1 -Semester 202608 -Crn 84715 -FirstGroup 7 -LastGroup 11
#>
[CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'High')]
param(
    [Parameter(Mandatory)] [ValidatePattern('^\d{6}$')] [string] $Semester,
    [Parameter(Mandatory)] [string] $Crn,
    [string] $Section = '001',
    [int] $FirstGroup = 1,
    [Parameter(Mandatory)] [int] $LastGroup,
    [switch] $IncludeDemo
)

if (-not (Get-AzContext)) { Connect-AzAccount | Out-Null }

$names = @($FirstGroup..$LastGroup | ForEach-Object {
    '{0}-CS330-{1}-{2}-Group{3:D2}' -f $Semester, $Section, $Crn, $_
})
if ($IncludeDemo) { $names += ('{0}-CS330-{1}-{2}-DEMO' -f $Semester, $Section, $Crn) }

$existing = @()
foreach ($name in $names) {
    $group = Get-AzResourceGroup -Name $name -ErrorAction SilentlyContinue
    if ($group) {
        $count = @(Get-AzResource -ResourceGroupName $name).Count
        Write-Output ('{0}  ({1} resources)' -f $name, $count)
        $existing += $name
    } else {
        Write-Warning "$name does not exist. Skipping."
    }
}

if ($existing.Count -eq 0) { Write-Output 'Nothing to delete.'; return }

if (-not $WhatIfPreference) {
    $answer = Read-Host "Type $Semester to permanently delete these $($existing.Count) resource groups"
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
