$taskName = "LifeOS_DailyLaunch"
$appPath = "$PSScriptRoot\..\dist-electron\win-unpacked\Life OS.exe" # Adjust this path based on where the built exe ends up
$triggerTime = "09:00"

# Check if task exists and unregister if so
if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create new trigger
$trigger = New-ScheduledTaskTrigger -Daily -At $triggerTime

# Create action
$action = New-ScheduledTaskAction -Execute $appPath

# Register task
Register-ScheduledTask -TaskName $taskName -Trigger $trigger -Action $action -Description "Launches Life OS daily for logging."

Write-Host "Task '$taskName' registered to run daily at $triggerTime."
