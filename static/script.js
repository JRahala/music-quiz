// init user 

// THERE IS A TIMING ISSUE WHEN WORKING OUT USER SCORE BUT HEY, GOOD NUFF

// CHECK FOR DEBUG CUX CHANGED score-board-container <- score-board id for opacity

var user = {'answer': false, score: 0000, high_score: [4000, 'Dummy player'], gameOver: false};
var song = {'element': document.getElementById('question-box'), 'question': '', 'answer': '', 'artist': ''};


function get_all_scores(){

    var xhr = new XMLHttpRequest();

    xhr.open('POST', '/get_leaderboard', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({}));

    var response = JSON.parse(xhr.responseText);
    return response.scores; // list of x scores

}


// IF THERE IS GOING TO BE AN ERROR IT WILL BE HERE

// fill board with empty rows
function fill_score_board(){

    // get all scores
    var score_board = get_all_scores();

    // fill out table

    var score_table = document.getElementById('score-board')
    score_table.innerHTML = ' <table id = "score-board"> <tr>  <th> Username </th> <th> Score </th> </tr> </table>'

    for (let i = 0; i < score_board.length; i ++) {
        var row = score_table.insertRow(i+1);
        var userName = row.insertCell(0);
        var userScore = row.insertCell(1);

        userName.innerText = score_board[i][0];
        userScore.innerText = score_board[i][1];
    }

}


// update all rows of table

// ------------------------------------------------------- MAKE THIS WORK ---------------------------------------

function update_score_board(){

    // loop through all of tr in id except for first (header)
    console.log('update score board');

    // get all scores
    var score_board = get_all_scores();

    var rows = document.getElementById('score-board').getElementsByTagName('tr');

    for (let i = 0; i < rows.length-1; i ++) {
        var row = rows[i+1];
        var cells = row.getElementsByTagName('td');

        cells[0].innerHTML = score_board[i][0];
        cells[1].innerHTML = score_board[i][1];
    }

}


function leader_board(){

    // remove final card and show leader board, with link to finishing page
    // replace the scores in the finish-card

    document.getElementById('score-board-container').style.opacity = 1;
    document.getElementById('finish-title').style.opacity = 0;
    document.getElementById('finish-score').style.opacity = 0;

    fill_score_board();

    var update_table = setInterval(()=>{
        if (document.getElementById('score-board-container').style.opacity == 0){
            clearInterval(update_table);
        }
        else{
            update_score_board();
        }
    }, 3000)

}

function get_high_score(){

    var xhr = new XMLHttpRequest();

    xhr.open('POST', '/get_leaderboard', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({'first': true}));

    var response = JSON.parse(xhr.responseText);
    return response.scores;

}


function submit_score(){

    // submit value from input box
    var username = document.getElementById('name-input').value;
    if (username == ''){
        alert('Username is empty')
    }

    else{
        
        var xhr = new XMLHttpRequest();

        xhr.open('POST', '/send_score', false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        // score displayed has some lag so just use that
        xhr.send(JSON.stringify({'name': username, 'score': document.getElementById('finish-score').innerText}));
    
        var response = JSON.parse(xhr.responseText);
        alert('User score updated successfully!');
        
    }

}


// song input

function add_question(){

    // simple prompt
    
    var song_title = prompt('type in name of the song');
    var song_artist = prompt('type in the name of the song\'s artist');

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/add_question', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({'title': song_title, 'artist': song_artist}));  

    var response = JSON.parse(xhr.responseText);
    alert(response.valid);

}


// I should really create a transitoin async function 

function replay(){
    
    console.log(document.getElementsByClassName('app-card'));

    var cards = document.getElementsByClassName('app-card');
    for(let i = 0; i < cards.length; i ++) {
        var element = cards[i];
        console.log(element);
        element.style.transition = 'opacity 1s';
        element.style.opacity = 0;
    }

    document.getElementById('question-card').style.transition = 'opacity 1s';
    document.getElementById('question-card').style.opacity = 1;

    user = {'answer': false, score: 0000, high_score: 4000, gameOver: false};
    document.getElementById('current-score').style.color = 'white';
    new_question();

}

// game over title screen

function end_game(){

    // clear scorer by setting gameOver = true
    user.gameOver = true;

    // create a reset button to display all hidden elements again and set user and send data
    document.getElementById('question-card').style.transition = 'opacity 1s';
    document.getElementById('question-card').style.opacity = 0;

    document.getElementById('finish-card').style.transition = 'opacity 1s';
    document.getElementById('finish-card').style.opacity = 1;

    document.getElementById('finish-score').innerText = user.score;

    // load the score board / finish score stuff

    document.getElementById('score-board-container').style.opacity = 0;
    document.getElementById('finish-title').style.opacity = 1;
    document.getElementById('finish-score').style.opacity = 1;


}


// insert spans for each _

function spanify(str){

    fin = '';

    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) == '_'){
            fin += '<span>' + str.charAt(i) + '</span>';
        }
        else{
            fin += str.charAt(i);
        }
    }

    return fin;

}

function wait(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(ms)
      }, ms )
    })
  }  


function emphasiseScore(){


    var number = document.getElementById('current-score');
    number.style.fontSize = '30px';
    number.style.transition = 'ease-in-out 1s font-size';
    setTimeout(function(){number.style.fontSize = '20px';}, 1000);


}

async function new_question(){

    // update score

    user.score += 1000;
    emphasiseScore();

    //  get question

    console.log('NEW QUESTION ----------------');

    var xhr = new XMLHttpRequest();

    xhr.open('POST', '/get_question', false);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({}));

    var response = JSON.parse(xhr.responseText);
    
    song.question = spanify(response.question);
    song.artist = response.artist;
    song.answer = response.answer

    // kewl css transition because i am vary cool

    song.element.style.opacity = 0;
    await wait(1000);
    song.element.style.opacity = 1;
    
    user.answer = false

    // update song div

    song.element.getElementsByTagName('div')[0].innerHTML = song.question;
    song.element.getElementsByTagName('div')[1].innerText = 'Artist | ' + song.artist;


    // start countDown
    countDown();

}


function render_score(){

    // check if user beats high score

    document.getElementById('current-score').innerText = 'Current Score : ' + user.score;
    if (user.score > user.high_score[0]){
        var number = document.getElementById('current-score');
        number.style.fontSize = '30px';
        number.style.color = 'gold';
        number.style.transition = 'ease-in-out 1s font-size, color';
    }

}

// countdown

function countDown(){

    // get current high score

    user.high_score = get_high_score();
    document.getElementById('high-score').innerText = ' High Score : ' + user.high_score[0] + ' - ' + user.high_score[1];


    function getWidth(elapsed){
        return (elapsed * 100 / (15 * 1000)).toString()  + '%';
    }

    function tickSeconds(elapsed){
        var number = document.getElementById('clock').getElementsByTagName('p')[0];
        number.innerText = elapsed / 1000;
        number.classList = 'emphasise-text';
        setTimeout(function(){number.classList = '';}, 500);

    }

    var timer = 15 * 1000
    var correctAnswer = false;
    var interval = 10;

    // asynchronus runs in background

    // add onto player
    var scorer = setInterval(() => {
        user.score += 10;
        render_score();

        if (user.gameOver == true){
            clearInterval(scorer);
        }
    }, 250);

    var x = setInterval(() => {

        timer -= interval;

        // change width of div
        var prog_bar = document.getElementById('prog-bar');
        prog_bar.style.width = getWidth(timer);
        

        if (timer % 1000 == 0){
            tickSeconds(timer)
        }

        if (timer <= 0 || user.answer == true){
            clearInterval(x);
            if (user.answer == true){
                new_question();
            }
            else{
                end_game();
            }
        }

    }, interval);


}



// listener for key strokes

document.addEventListener("keypress", function(event) {

    // dont want answers to spill over to next question
    if (user.answer == true){
        return null;
    }

    // console.log(event.key);
    // console.log(event);
    
    // select all spans where class != correct
    var target = song.element.getElementsByTagName('div')[0].querySelector('span:not([class = "correct"])');

    if (target){

        // target != null ... set span class = correct/incorrect

        // answer is correct
        if (event.key.toLowerCase() == song.answer.toLowerCase().charAt(0)){

            // gain points
            user.score += 500;

            target.classList = 'correct';
            target.innerText = song.answer.charAt(0);
            song.answer = song.answer.slice(1);

            // check for full answer
            if (song.answer.length == 0){ user.answer = true };

        }

        // answer is not correct
        else{ 

            // lose points
            user.score -= 100;

            target.innerText = event.key;
            target.classList = 'incorrect'; 

        }

    }

    else{
        // check for full answer
        user.answer = true;
    }

    

})


// can make this trigger after start up screen later

new_question()
// for title debug -> end_game();