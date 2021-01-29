<?php
session_start();
require_once 'database.php';

header('Content-Type: application/json;charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    function fetchTodos($user_id)
    {
        global $conn;

        $stmt = $conn->prepare('SELECT id, text, status, createdAt, updatedAt from todos where todos.user_id=? AND todos.status != "deleted"');

        $stmt->bind_param('i', $user_id);
        $stmt->execute();

        $result = $stmt->get_result();

        return $result->fetch_all(MYSQLI_ASSOC);
    }

    function fetchTodo($user_id, $todo_id)
    {
        global $conn;

        $stmt = $conn->prepare('SELECT id, text, status, createdAt, updatedAt from todos where todos.user_id=? AND todos.id=? AND todos.status != "deleted" LIMIT 1');

        $stmt->bind_param('ii', $user_id, $todo_id);
        $stmt->execute();

        $result = $stmt->get_result();

        return $result->fetch_assoc();
    }

    function fetchLastTodo($user_id)
    {
        global $conn;

        $stmt = $conn->prepare('SELECT id, text, status, createdAt, updatedAt from todos where todos.user_id=? AND todos.status != "deleted" order by todos.id DESC LIMIT 1');

        $stmt->bind_param('i', $user_id);
        $stmt->execute();

        $result = $stmt->get_result();

        return $result->fetch_assoc();
    }

    function setTodoStatus($todo_id, $user_id, $status)
    {
        global $conn;

        $stmt = $conn->prepare('UPDATE todos set todos.status=?, todos.updatedAt=CURRENT_TIMESTAMP where todos.user_id=? AND todos.id=? LIMIT 1');

        $stmt->bind_param('sii', $status, $user_id, $todo_id);
        $stmt->execute();

        return $stmt->affected_rows;
    }

    function deleteTodo($todo_id, $user_id)
    {
        global $conn;

        $stmt = $conn->prepare('UPDATE todos set todos.status="deleted", todos.updatedAt=CURRENT_TIMESTAMP where todos.user_id=? AND todos.id=? LIMIT 1');

        $stmt->bind_param('ii', $user_id, $todo_id);
        $stmt->execute();

        if ($stmt->affected_rows) {

            $todo = fetchTodo($user_id, $todo_id);
            $stmt2 = $conn->prepare('INSERT into todos (text, user_id, status) value (?, ?, ?)');

            $stmt2->bind_param('sis', $todo['text'], $todo['user_id'], $todo['status']);
            $stmt2->execute();
        }

        return $stmt->affected_rows;
    }

    function fetchUser($user_id)
    {
        global $conn;

        $stmt = $conn->prepare('SELECT id, name, username from users where users.id=? LIMIT 1');

        $stmt->bind_param('i', $user_id);
        $stmt->execute();

        $result = $stmt->get_result();

        return $result->fetch_assoc();
    }

    if ($_REQUEST['action'] === 'login') {
        if (!isset($_REQUEST['username'])) {
            http_response_code(400);
            $data = ['status' => 'failed', 'message' => 'Username is required.'];
            echo json_encode($data);
            return;
        }

        if (!isset($_REQUEST['password'])) {
            http_response_code(400);
            $data = ['status' => 'failed', 'message' => 'Password is required.'];
            echo json_encode($data);
            return;
        }

        // attempt to login
        $username = $_REQUEST['username'];
        $password = $_REQUEST['password'];

        $stmt = $conn->prepare('SELECT id, name, username, password from users where users.username=? LIMIT 1');

        $stmt->bind_param('s', $username);
        $stmt->execute();

        $result = $stmt->get_result();

        $user = $result->fetch_assoc();

        if (!$user) {
            $data = ['status' => 'failed', 'message' => 'User not found.'];
            http_response_code(404);
            echo json_encode($data);
            return;
        }

        $verified = password_verify($password, $user['password']);
        if (!$verified) {
            $data = ['status' => 'failed', 'message' => 'Invalid username / password combination.'];
            http_response_code(401);
            echo json_encode($data);
            return;
        }

        $todos = fetchTodos($user['id']);

        $slim_user = [
            'id' => $user['id'],
            'name' => $user['name'],
            'username' => $user['username'],
        ];

        $user_data = [
            'user' => $slim_user,
            'todos' => $todos,
        ];

        $data = [
            'status' => 'success',
            'message' => 'Login success',
            'data' => $user_data
        ];

        $_SESSION['user'] = $slim_user;

        http_response_code(200);
        echo json_encode($data);
        return;
    } else if ($_REQUEST['action'] === 'signup') {

        if (!isset($_REQUEST['name'])) {
            http_response_code(400);
            $data = ['status' => 'failed', 'message' => 'Name is required.', 'key' => 'name'];
            echo json_encode($data);
            return;
        }

        if (!isset($_REQUEST['username'])) {
            http_response_code(400);
            $data = ['status' => 'failed', 'message' => 'Username is required.', 'key' => 'username'];
            echo json_encode($data);
            return;
        }

        if (!isset($_REQUEST['password'])) {
            http_response_code(400);
            $data = ['status' => 'failed', 'message' => 'Password is required.', 'key' => 'password'];
            echo json_encode($data);
            return;
        }

        // attempt to login
        $name = $_REQUEST['name'];
        $username = $_REQUEST['username'];
        $password = $_REQUEST['password'];

        $stmt = $conn->prepare('SELECT username from users where users.username=? LIMIT 1');

        $stmt->bind_param('s', $username);
        $stmt->execute();

        $result = $stmt->get_result();

        $user = $result->fetch_assoc();

        if ($user) {
            $data = ['status' => 'failed', 'message' => 'Username already exists, try another username.', 'key' => 'username'];
            http_response_code(422);
            echo json_encode($data);
            return;
        }

        $hashed = password_hash($password, PASSWORD_DEFAULT);

        $stmt2 = $conn->prepare('INSERT into users (name, username, password) value (?, ?, ?)');

        $stmt2->bind_param('sss', $name, $username, $hashed);
        $stmt2->execute();

        $result = $stmt2->affected_rows;

        if (!$result) {
            $data = ['status' => 'failed', 'message' => 'Could not create your account.', 'key' => 'name'];
            http_response_code(400);
            echo json_encode($data);
            return;
        }

        $user_id = $stmt2->insert_id;

        $newUser = fetchUser($user_id);

        $slim_user = [
            'id' => $newUser['id'],
            'name' => $newUser['name'],
            'username' => $newUser['username'],
        ];

        $data = [
            'status' => 'success',
            'message' => 'Signup success',
            'data' => $slim_user
        ];

        $_SESSION['user'] = $slim_user;

        http_response_code(200);
        echo json_encode($data);
        return;
    } else if ($_REQUEST['action'] === 'add-todo') {
        if (!isset($_REQUEST['text'])) {
            http_response_code(400);
            $data = ['status' => 'failed', 'message' => 'Text is required.'];
            echo json_encode($data);
            return;
        }

        if (!isset($_REQUEST['user'])) {
            http_response_code(400);
            $data = ['status' => 'failed', 'message' => 'User is required.'];
            echo json_encode($data);
            return;
        }

        // attempt to login
        $text = $_REQUEST['text'];
        $user_id = $_REQUEST['user'];

        $user = fetchUser($user_id);

        if (!$user) {
            $data = ['status' => 'failed', 'message' => 'User account does not exist.'];
            http_response_code(404);
            echo json_encode($data);
            return;
        }

        $stmt = $conn->prepare('INSERT into todos (text, user_id) value (?, ?)');

        $stmt->bind_param('si', $text, $user_id);
        $stmt->execute();

        $result = $stmt->affected_rows;

        if (!$result) {
            $data = ['status' => 'failed', 'message' => 'Could not create Todo item.'];
            http_response_code(400);
            echo json_encode($data);
            return;
        }

        $todo = fetchLastTodo($user_id);

        $data = [
            'status' => 'success',
            'message' => 'Todo item created',
            'data' => $todo
        ];

        http_response_code(201);
        echo json_encode($data);
        return;
    } else if ($_REQUEST['action'] === 'change-todo-status') {
        if (!isset($_REQUEST['todo'])) {
            http_response_code(400);
            $data = ['status' => 'failed', 'message' => 'Todo is required.'];
            echo json_encode($data);
            return;
        }

        if (!isset($_REQUEST['status'])) {
            http_response_code(400);
            $data = ['status' => 'failed', 'message' => 'Status is required.'];
            echo json_encode($data);
            return;
        }

        if (!isset($_REQUEST['user'])) {
            http_response_code(400);
            $data = ['status' => 'failed', 'message' => 'User is required.'];
            echo json_encode($data);
            return;
        }

        // attempt to login
        $todo_id = $_REQUEST['todo'];
        $status = $_REQUEST['status'];
        $user_id = $_REQUEST['user'];

        $user = fetchUser($user_id);

        if (!$user) {
            $data = ['status' => 'failed', 'message' => 'User account does not exist.'];
            http_response_code(404);
            echo json_encode($data);
            return;
        }

        $current_todo = fetchTodo($user_id, $todo_id);
        if ($current_todo && $status === $current_todo['status']) {
            $data = ['status' => 'failed', 'message' => 'Todo item status is the same.'];
            http_response_code(400);
            echo json_encode($data);
            return;
        }

        $result = setTodoStatus($todo_id, $user_id, $status);

        if (!$result) {
            $data = ['status' => 'failed', 'message' => 'Could not change Todo item status.'];
            http_response_code(400);
            echo json_encode($data);
            return;
        }

        $todo = fetchTodo($user_id, $todo_id);

        $data = [
            'status' => 'success',
            'message' => 'Todo item updated',
            'data' => $todo
        ];

        http_response_code(200);
        echo json_encode($data);
        return;
    } else if ($_REQUEST['action'] === 'delete-todo') {
        if (!isset($_REQUEST['todo'])) {
            http_response_code(400);
            $data = ['status' => 'failed', 'message' => 'Todo is required.'];
            echo json_encode($data);
            return;
        }

        if (!isset($_REQUEST['user'])) {
            http_response_code(400);
            $data = ['status' => 'failed', 'message' => 'User is required.'];
            echo json_encode($data);
            return;
        }

        // attempt to login
        $todo_id = $_REQUEST['todo'];
        $user_id = $_REQUEST['user'];

        $user = fetchUser($user_id);

        if (!$user) {
            $data = ['status' => 'failed', 'message' => 'User account does not exist.'];
            http_response_code(404);
            echo json_encode($data);
            return;
        }

        $current_todo = fetchTodo($user_id, $todo_id);
        if ($current_todo && 'deleted' === $current_todo['status']) {
            $data = ['status' => 'failed', 'message' => 'Todo item already deleted.'];
            http_response_code(400);
            echo json_encode($data);
            return;
        }

        $result = deleteTodo($todo_id, $user_id);

        if (!$result) {
            $data = ['status' => 'failed', 'message' => 'Could not delete Todo item.'];
            http_response_code(400);
            echo json_encode($data);
            return;
        }

        $todo = fetchTodo($user_id, $todo_id);

        $data = [
            'status' => 'success',
            'message' => 'Todo item deleted',
            'data' => $todo
        ];

        http_response_code(200);
        echo json_encode($data);
        return;
    }

    http_response_code(404);
    echo json_encode([
        'status' => 'failed',
        'message' => 'Endpoint not found',
    ]);
    return;
}

http_response_code(404);
echo json_encode([
    'status' => 'failed',
    'message' => 'Method not allowed',
]);
return;
