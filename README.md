# TaskDapp

This is a decentralized task management application powered by Cartesi Rollups. It allows users to create tasks, update task statuses, and retrieve task details in a decentralized environment.

## Installation Instructions

Follow the [Cartesi Rollups installation guide](https://docs.cartesi.io/cartesi-rollups/1.3/development/installation/)

## Compiling and Running Instructions

1. Clone the repository
2. Run `cd tasktesi`
3. Run `cartesi build`
4. Run `cartesi run`
5. Run `cartesi send` on a new terminal tab to send inputs to the application

## Usage

Send advance requests with payloads in the following formats:

### Create Task

```json
{
  "action": "createTask",
  "taskId": "task1",
  "description": "Complete project documentation",
  "assignee": "Alice"
}
```

### Update Task Status

```json
{
  "action": "updateTaskStatus",
  "taskId": "task1",
  "newStatus": "in_progress"
}
```

### Get Task Details

```json
{
  "action": "getTaskDetails",
  "taskId": "task1"
}
```

## Inspecting State

- To inspect all tasks, use the route "all_tasks".
- To get a list of all task IDs, use the route "task_ids".
#   c a t e s i - d a p p -  
 