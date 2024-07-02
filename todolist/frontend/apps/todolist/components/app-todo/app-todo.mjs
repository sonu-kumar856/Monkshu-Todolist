import { router } from "/framework/js/router.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { apimanager as apiman } from "/framework/js/apimanager.mjs";

const addTodo = async () => {
    const todoText = app_todo.shadowRoot.querySelector("#new-todo").value;
    if (!todoText) return;

    const resp = await apiman.rest(APP_CONSTANTS.API_TODO, "POST", {
        operation: "add",
        todo: { text: todoText, completed: false }
    });

    if (resp.result) {
        app_todo.shadowRoot.querySelector("#new-todo").value = "";
        await loadTodos();
    }
}

const loadTodos = async () => {
    const resp = await apiman.rest(APP_CONSTANTS.API_TODO, "POST", { operation: "list" });
    if (resp.result) {
        app_todo.bindData({ todos: resp.todos });
    }
}

const toggleTodo = async (id) => {
    const todos = app_todo.getData().todos;
    const todo = todos.find(t => t.id === id);
    const resp = await apiman.rest(APP_CONSTANTS.API_TODO, "POST", {
        operation: "update",
        id,
        todo: { completed: !todo.completed }
    });

    if (resp.result) app_todo.bindData({ todos: resp.todos });
}

const deleteTodo = async (id) => {
    const resp = await apiman.rest(APP_CONSTANTS.API_TODO, "POST", {
        operation: "delete",
        id
    });

    if (resp.result) app_todo.bindData({ todos: resp.todos });
}

function register() {
    monkshu_component.register("app-todo", `${APP_CONSTANTS.APP_PATH}/components/app-todo/app-todo.html`, app_todo);
}

const trueWebComponentMode = true;

export const app_todo = { trueWebComponentMode, register, addTodo, loadTodos, toggleTodo, deleteTodo }

app_todo.elementConnected = async element => await loadTodos();