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


class ListService {
    static url = 'https://crudcrud.com/api/b90ca1ec7c0544f288a959f9f5d2ce87/lists';

    // Read in CRUD 
    static getAllLists() { // WORKING
        return $.ajax({
            url: this.url,
            dataType: 'json',
            data: JSON.stringify(),
            contentType: 'application/json',
            type: 'GET'
        });
    }

    // Read in CRUD
    static getList(list) { // WORKING
        return $.ajax({
            url: this.url,
            dataType: 'json',
            data: JSON.stringify(list),
            contentType: 'application/json',
            type: 'GET'
        });
    }

    //Create in CRUD
    static createList(list) { // WORKING
        return $.ajax({
            url: this.url,
            dataType: 'json',
            data: JSON.stringify(list),
            contentType: 'application/json',
            type: 'POST'
        });
    }

    //Update in CRUD
    static updateList(list, id) {
        console.log(list);
        // console.log(list);
        return $.ajax({
            url: this.url + "/" + id,
            dataType: 'json',
            data: JSON.stringify({ list }),
            contentType: 'application/json',
            type: 'PUT'
        });
    }

    //Delete in CRUD
    static deleteList(id) { // WORKING
        return $.ajax({
            url: this.url + "/" + id,
            dataType: 'json',
            data: JSON.stringify(id),
            contentType: 'application/json',
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
                ListService.updateList(list, id)
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
                                <div class="col">
                                    <input type="text" id="${list._id}-task-name" class="form-control" placeholder="New Task">
                                </div>
                                <div class="col">
                                    <input type="date" id="${list._id}-task-date" class="form-control" placeholder="Task Date">
                                </div><br>
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