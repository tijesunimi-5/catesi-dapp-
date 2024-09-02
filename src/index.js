const { hexToString, stringToHex } = require("viem");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

const tasks = {};

function createTask(taskId, description, assignee) {
  if (tasks[taskId]) {
    throw new Error("Task already exists");
  }
  tasks[taskId] = { description, assignee, status: "pending" };
  console.log(`Created task: ${taskId} - ${description} assigned to ${assignee}`);
}

function updateTaskStatus(taskId, newStatus) {
  if (!tasks[taskId]) {
    throw new Error("Task does not exist");
  }
  tasks[taskId].status = newStatus;
  console.log(`Updated task ${taskId} status to ${newStatus}`);
}

function getTaskDetails(taskId) {
  if (!tasks[taskId]) {
    throw new Error("Task does not exist");
  }
  return tasks[taskId];
}

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));
  const payloadString = hexToString(data.payload);
  console.log(`Converted payload: ${payloadString}`);

  try {
    const payload = JSON.parse(payloadString);
    let result;

    switch (payload.action) {
      case "createTask":
        createTask(payload.taskId, payload.description, payload.assignee);
        result = "Task created successfully";
        break;
      case "updateTaskStatus":
        updateTaskStatus(payload.taskId, payload.newStatus);
        result = "Task status updated successfully";
        break;
      case "getTaskDetails":
        result = JSON.stringify(getTaskDetails(payload.taskId));
        break;
      default:
        throw new Error("Invalid action");
    }

    const outputStr = stringToHex(result);
    await fetch(rollup_server + "/notice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: outputStr }),
    });
  } catch (error) {
    console.error("Error processing request:", error);
  }
  return "accept";
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));

  const payload = data["payload"];
  const route = hexToString(payload);

  let responseObject;
  if (route === "all_tasks") {
    responseObject = JSON.stringify(tasks);
  } else if (route === "task_ids") {
    responseObject = JSON.stringify(Object.keys(tasks));
  } else {
    responseObject = "route not implemented";
  }

  const report_req = await fetch(rollup_server + "/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: stringToHex(responseObject) }),
  });

  return "accept";
}


var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();