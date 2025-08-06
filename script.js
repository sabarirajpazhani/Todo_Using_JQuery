$(document).ready(async function () {
  const API_LINK = "http://localhost:3000/tasks";
  const resultPage = $("#result");
  let editingTaskID = null;

  $("#add_task")
    .button()
    .click(function () {
      $("form")[0].reset();
      $("#task_input")
        .dialog("option", "title", "Add Task Details")
        .dialog("open");
      $("#task_input")
        .dialog("widget")
        .find(".ui-dialog-buttonpane button:eq(1)")
        .hide();
      $("#task_input")
        .dialog("widget")
        .find(".ui-dialog-buttonpane button:eq(0)")
        .show();
    });

  //GET all the Task
  async function resultTask() {
    resultPage.empty();

    const result = await fetch(API_LINK);
    const task_data = await result.json();
    const result_task = task_data.sort((a, b) => a.priority - b.priority);

    if (result_task.length == 0) {
      const msgH2 = $("<h2>").addClass("emptyMsg").text("Empty todos");
      resultPage.append(msgH2);
      return;
    }

    result_task.forEach((task) => {
      console.log(task.title);
      const mainDiv = $("<div>").addClass("mainDiv");
      const titleH1 = $("<h1>").addClass("title").text(`${task.title}`);
      const descP = $("<p>")
        .addClass("desc")
        .text(`Description: ${task.description}`);

      const priorityH3 = $("<h3>")
        .addClass("priority")
        .text(`Priority: ${task.priority}`);

      const date = new Date(task.createdDate).toDateString();

      console.log(date);
      const createdDate = $("<h4>")
        .addClass("creatD")
        .text(`Created Date: ${date}`);

      const isDoneH3 = $("<h3>")
        .addClass("isDone")
        .text(`Is Done: ${task.isDone}`);

      let updateD = "";
      if (task.updatedDate == "null") {
        updateD = "";
      } else {
        updateD = task.updatedDate;
      }
      const updateDate = $("<h3>").addClass("isDone").text(updateD);

      const btnEdit = $("<button>")
        .addClass("edit") //PUT - updating the task
        .text("Edit")
        .on("click", function () {
          console.log(task.id);
          const id = task.id;
          editingTaskID = id;

          $("#task_input")
            .dialog("option", "title", "Editing Task")
            .dialog("open");
          $("#task_input")
            .dialog("widget")
            .find(".ui-dialog-buttonpane button:eq(1)")
            .show();
          $("#task_input")
            .dialog("widget")
            .find(".ui-dialog-buttonpane button:eq(0)")
            .hide();

          $("#userTitle").val(task.title);
          $("#userDesc").val(task.description);
          $("#Priority").val(task.priority);
          $("input[name='isDone']:checked").val(task.isDone);
          //storing id in session storage
          sessionStorage.setItem("User", JSON.stringify({ id }));
        });

      const btnDel = $("<button>")
        .addClass("del") //DELETE the particular task
        .text("Delete")
        .on("click", function () {
          $("#delete-message").text("You want to delete todo ?");
          $("#delete-dialog").dialog({
            width: 400,
            buttons: {
              Delete: function (e) {
                console.log(task.id);
                const id = task.id;
                $.ajax({
                  url: `${API_LINK}/${id}`,
                  type: "DELETE",
                  success: function () {
                    resultTask();
                  },
                });
              },
              Cancel: function (e) {
                $("#delete-dialog").dialog("close");
              },
            },
          });
        });

      mainDiv
        .append(titleH1)
        .append(descP)
        .append(priorityH3)
        .append(createdDate)
        .append(isDoneH3)
        .append(updateDate)
        .append(btnEdit)
        .append(btnDel);

      resultPage.append(mainDiv);
    });
    $("#result").sortable({ axis: "y", containment: ".container" });
  }

  //POST
  $("#task_input").dialog({
    autoOpen: false,
    modal: true,
    width: 400,
    buttons: {
      Save: function (e) {
        e.preventDefault();

        const title = $("#userTitle").val().trim();
        const description = $("#userDesc").val().trim();
        const priority = $("#Priority").val().trim();
        const createdDate = new Date();
        // const isDone = $("#yes").val().trim();
        const isDone = $("input[name='isDone']:checked").val();
        console.log(isDone);
        const updatedDate = "null";

        if (!title || !description || !priority || !createdDate || !isDone) {
          $("#errpr-message").text("Enter the all input filed!");
          $("#error-dialog").dialog({
            modal: true,
            buttons: {
              OK: function () {
                $(this).dialog("close");
              },
            },
          });
          $("#error-dialog").dialog("open");
          // alert("Enter the all input filed!");
          return;
        }

        // store created last in local storage
        localStorage.setItem(
          "tasks",
          JSON.stringify({
            title,
            description,
            priority,
            createdDate,
            isDone,
            updatedDate,
          })
        );

        $.ajax({
          method: "POST",
          url: `${API_LINK}`,
          data: JSON.stringify({
            title,
            description,
            priority,
            createdDate,
            isDone,
            updatedDate,
          }),
          dataType: "json",
          success: function (response) {
            // alert("Task as been Successfully Added!");
            $("#task_input").dialog("close");
            resultTask();
          },
          error: function (xhr, status, error) {
            console.log(xhr.status);
            console.log(error);
          },
        });
      },
      Edit: function edit_Task(e) {
        const title = $("#userTitle").val().trim();
        const description = $("#userDesc").val().trim();
        const priority = $("#Priority").val().trim();
        const isDone = $("input[name='isDone']:checked").val();
        const updatedDate = new Date().toDateString();

        if (!title || !description || !priority || !isDone) {
          $("#errpr-message").text("Enter the all input filed!");
          $("#error-dialog").dialog({
            modal: true,
            buttons: {
              OK: function () {
                $(this).dialog("close");
              },
            },
          });
          // alert("Enter the all input filed!");
          return;
        }

        $.ajax({
          type: "PATCH",
          url: `${API_LINK}/${editingTaskID}`,
          data: JSON.stringify({
            title,
            description,
            priority,
            isDone,
            updatedDate,
          }),
          dataType: "dataType",
          success: function (response) {
            $("form")[0].reset();
            alert("Successfully updated!");
            console.log("Successfully updated!");
          },
        });
        resultTask();
      },
      Cancel: function (e) {
        $("#task_input").dialog("close");
      },
    },
  });

  //Searching
  const searchingFetch = await fetch(API_LINK);
  const searchingArr = await searchingFetch.json();
  console.log(searchingArr);

  $("#searching").on("input", function (e) {
    console.log(e.target.value);
    const task = searchingArr.filter((tasks) => {
      console.log(tasks.title);
      return tasks.title.toLowerCase().includes(e.target.value.toLowerCase());
    });

    searchResult(task);
  });

  $("#filter").val();
  console.log(
    $("#filter").on("change", function () {
      console.log($("#filter").val());
      const task = searchingArr.filter((tasks) => {
        return tasks.priority.toLowerCase() === $("#filter").val();
      });
      if (task.length == 0) {
        resultPage.empty();
        const msgH2 = $("<h2>").addClass("emptyMsg").text("Empty todos");
        resultPage.append(msgH2);
      }
      else{
        searchResult(task);
      }
      
    })
  );

  function searchResult(task) {
    resultPage.empty();
    task.forEach((task) => {
      console.log(task.title);
      const mainDiv = $("<div>").addClass("mainDiv");
      const titleH1 = $("<h3>").addClass("title").text(`${task.title}`);
      const descP = $("<p>")
        .addClass("desc")
        .text(`Description: ${task.description}`);

      const priorityH3 = $("<h3>")
        .addClass("priority")
        .text(`Priority: ${task.priority}`);

      const date = new Date(task.createdDate).toDateString();

      console.log(date);
      const createdDate = $("<h4>")
        .addClass("creatD")
        .text(`Created Date: ${date}`);

      const isDoneH3 = $("<h3>")
        .addClass("isDone")
        .text(`Is Done: ${task.isDone}`);

      let updateD = "";
      if (task.updatedDate == "null") {
        updateD = "";
      } else {
        updateD = task.updatedDate;
      }
      const updateDate = $("<h3>").addClass("isDone").text(updateD);

      const btnEdit = $("<button>")
        .addClass("edit") //PUT - updating the task
        .text("Edit")
        .on("click", function () {
          console.log(task.id);
          const id = task.id;
          editingTaskID = id;

          $("#task_input")
            .dialog("option", "title", "Editing Task")
            .dialog("open");
          $("#task_input")
            .dialog("widget")
            .find(".ui-dialog-buttonpane button:eq(1)")
            .show();
          $("#task_input")
            .dialog("widget")
            .find(".ui-dialog-buttonpane button:eq(0)")
            .hide();

          $("#userTitle").val(task.title);
          $("#userDesc").val(task.description);
          $("#Priority").val(task.priority);
          $("input[name='isDone']:checked").val(task.isDone);
          //storing id in session storage
          sessionStorage.setItem("User", JSON.stringify({ id }));
        });

      const btnDel = $("<button>")
        .addClass("del") //DELETE the particular task
        .text("Delete")
        .on("click", function () {
          console.log(task.id);
          const id = task.id;
          $.ajax({
            url: `${API_LINK}/${id}`,
            type: "DELETE",
            success: function () {
              alert("Task with ID " + id + " deleted Successfully");
              resultTask();
            },
          });
        });

      mainDiv
        .append(titleH1)
        .append(descP)
        .append(priorityH3)
        .append(createdDate)
        .append(isDoneH3)
        .append(updateDate)
        .append(btnEdit)
        .append(btnDel);

      resultPage.append(mainDiv);
      $("#result").sortable({ axis: "y", containment: ".container" });
    });
  }

  resultTask();
});
