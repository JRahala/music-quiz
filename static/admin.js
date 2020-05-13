function edit_question(){

    var edit_q = prompt('Type in question to edit');
    var new_q = prompt('Type in new name of question');

    xhr.open('POST', '/edit_question', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({'q_name': edit_name, 'new_name': new_q}));

    var response = JSON.parse(xhr.responseText);
    console.log(response)

}


function del_question(){

    var q_name = prompt('Type in question to delete');

    xhr.open('POST', '/del_question', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({'q_name': q_name}));

    var response = JSON.parse(xhr.responseText);
    console.log(response)

}


function load_table(){

    var table = document.getElementById('question-table');
    
    var xhr = new XMLHttpRequest();

    // Oh god, I have to format the questino database, cuz thats fun {questino -> obj.}

    xhr.open('POST', '/get_all_questions', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({}));

    var response = JSON.parse(xhr.responseText);
    console.log(response)

    response = response.names;
    console.log(response)

    for (let i = 0; i < response.length; i ++) {

        var row = table.insertRow(i+1);
        var questionName = row.insertCell(0);
        var editBtn = row.insertCell(1);
        var delBtn = row.insertCell(2);

        questionName.innerText = response[i];
        console.log(response[i]);
    }


}

window.onload = function(){
    load_table();
};