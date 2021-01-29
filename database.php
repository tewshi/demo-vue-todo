<?php
$servername = "localhost";
$username = "root";
$password = "";
$database = "dera_group_todo_app";

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
