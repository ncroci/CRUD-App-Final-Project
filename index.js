class List {
    constructor(name) {
        this.name = name;
        this.tasks = [];
    }

    addTask(name, date) {
        this.tasks.push(new Task(name, date));
    }
}

class Task {
    constructor(name, date) {
        this.name = name;
        this.date = date;
    }
}

// fetch('https://crudcrud.com/api/b90ca1ec7c0544f288a959f9f5d2ce87/todos', {
//   headers: { "Content-Type": "application/json; charset=utf-8" },
//   method: 'POST',
//   body: JSON.stringify({
//     name: 'Name',
//     date: 'Date Test',
//   })
// })
// .then(response => response.json())
// .then(data => console.log(data))

class ListService {
    static url = 'https://crudcrud.com/api/b90ca1ec7c0544f288a959f9f5d2ce87/todos';

    static getAllLists() {
        return $.get(this.url); 
    }

    static getList(id) {
        return $.get(this.url + `/${id}`);
    }

    static createList(list) { 
        return $.post(this.url, list);
    }

    static updateList(list) {
        return $.ajax({
            url: this.url + `/${list._id}`, 
            dataType: 'json',
            data: JSON.stringify(list),
            contentType: 'application/json',
            type: 'PUT'
        }); 
    }

    static deleteList(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

class DOMManager {
    static lists;

    static getAllLists() {
        ListService.getAllLists().then(lists => this.render(lists));
    }

    static createList(name) {
        ListService.createList(new List(name))
            .then(() => {
                return ListService.getAllLists();
            })
            .then((lists) => this.render(lists));
    }

    static deleteList(id) {
        ListService.deleteList(id)
            .then(() => {
                return ListService.getAllLists();
            })
            .then((lists) => this.render(lists));
    }

    static addTask(id) {
        for (let list of this.lists) {
            if (list._id == id) {
                list.tasks.push(new Task($(`#${list._id}-task-name`).val(), $(`#${list._id}-task-date`).val()));
                ListService.updateList(list)
                    .then(() => {
                        return ListService.getAllLists();
                    })
                    .then((lists) => this.render(lists));
            }
        }
    }

    static deleteTask(listId, taskId) {
        for (let list of this.lists) {
            if (list._id == listId) {
                for (let task of list.tasks) {
                    if (task._id == taskId) {
                        list.tasks.splice(list.tasks.indexOf(task), 1);
                        ListService.updateList(list) 
                            .then(() => {
                                return ListService.getAllLists();
                            })
                            .then((lists) => this.render(lists));
                    }
                }
            }
        }
    }

    static render(lists) {
        this.lists = lists;
        $('#app').empty();
        for (let list of lists) {
            $('#app').prepend(
                `
                <div id="${list._id}" class="card">
                    <div class="card-header">
                        <h2>${list.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteList('${list._id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class"row">
                                <div class="col-sm">
                                    <input type="text" id="${list._id}-task-name" class="form-control" placeholder="Task Name">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${list._id}-task-date" class="form-control" placeholder="Task Date">
                                </div>
                            </div>
                            <button id="${list._id}-new-task" onclick="DOMManager.addTask('${list._id}')" class="btn btn-primary form-control"> Add</button>
                        </div>
                    </div>
                </div><br>`
            );
            for (let task of list.tasks) {
                $(`#${list._id}`).find('.card-body').append(
                    `<p>
                        <span id="name-${task._id}"><strong>Name: </strong> ${task.name}</span>
                        <span id="date-${task._id}"><strong>date: </strong> ${task.date}</span>
                        <button class="btn btn-danger" onclick="DOMManager.deleteTask('${list._id}', '${task._id}')">Delete Task</button>`
                );
            }
        }
    }
}

$('#create-new-list').click(() => {
    DOMManager.createList($('#new-list-name').val());
    $('#new-list-name').val('');
});

DOMManager.getAllLists();
