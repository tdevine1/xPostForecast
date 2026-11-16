<#
.SYNOPSIS
Gives a list of people a role (default Contributor) on one resource group.

.DESCRIPTION
Reads e-mail addresses from a text file (one per line; blank lines and lines starting with # are
ignored), looks each person up in Microsoft Entra ID, and assigns the role on the resource group.
People who already have the role are skipped, so the script is safe to run again.

Keep the e-mail file OUT of Git. Student addresses are personal data, so this script takes them from a
file you control instead of storing them in the script.

Requires the Az PowerShell module (Az.Accounts, Az.Resources).

.PARAMETER ResourceGroupName
The resource group to add people to, for example 202608-CS330-001-84715-Group01.

.PARAMETER EmailsFile
Path to the text file of e-mail addresses (see students.example.txt).

.PARAMETER SubscriptionName
Subscription name or id to select first. Optional if you are already in the right one.

.PARAMETER Role
Role to assign. Default Contributor. Use a narrower role if the team does not need to change resources.

.EXAMPLE
.\Add-UsersToResourceGroup.ps1 -ResourceGroupName 202608-CS330-001-84715-Group01 -EmailsFile .\group01.txt -WhatIf
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)] [string] $ResourceGroupName,
    [Parameter(Mandatory)] [string] $EmailsFile,
    [string] $SubscriptionName,
    [string] $Role = 'Contributor'
)

if (-not (Get-AzContext)) { Connect-AzAccount | Out-Null }
if ($SubscriptionName) { Select-AzSubscription -Subscription $SubscriptionName | Out-Null }

$emails = Get-Content -LiteralPath $EmailsFile |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ -and -not $_.StartsWith('#') }

foreach ($email in $emails) {
    $user = Get-AzADUser -UserPrincipalName $email
    if (-not $user) {
        Write-Warning "User $email was not found in Entra ID."
        continue
    }

    $existing = Get-AzRoleAssignment -ObjectId $user.Id -RoleDefinitionName $Role `
        -ResourceGroupName $ResourceGroupName -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Output "$email already has $Role on $ResourceGroupName."
        continue
    }

    if ($PSCmdlet.ShouldProcess("$email on $ResourceGroupName", "Assign role $Role")) {
        New-AzRoleAssignment -ObjectId $user.Id -RoleDefinitionName $Role -ResourceGroupName $ResourceGroupName | Out-Null
        Write-Output "Added $email to $ResourceGroupName as $Role."
    }
}

Write-Output 'Finished.'
