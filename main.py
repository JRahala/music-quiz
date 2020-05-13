
# create admin page for displaying questions and making sure no one screws up a questino that noone cna answer

# Latest edit for dicitionary instances rather than list


import random
import pickle
from flask import Flask, request, render_template, jsonify
app = Flask(__name__)

global scoreCap
scoreCap = 100 # only keep x top scores

if input('First time setup? [y/n] >> ').lower() == 'y':

    file = open('questions.pickle', 'wb')
    pickle.dump({}, file) #![]
    file.close()

    file = open('scores.pickle', 'wb')
    # stores top ten ------------ check related score leader boards for debugging
    pickle.dump([[0000,'Dummy'] for i in range(scoreCap)], file)
    file.close()

    


class Question:

    #!Titles = set()

    def __init__(self, question, artist):


        ''' right now the questions have to be in the ready to go format lk_asdkfj_asdfkh_ '''

        #!Question.Instances.append(self) 
        Question.Instances[question] = self
        #!Question.Titles.add(question)

        self.question = question
        self.artist = artist

        self.write_to_db()


    def write_to_db(self):

        # the most inefficient db system

        file = open('questions.pickle', 'wb')
        pickle.dump(Question.Instances, file)
        file.close()


    def scramble(self):

        ''' return the scrambled question and answers '''

        ans = ''
        question = ''

        for i in self.question:
            if random.random() > 0.75 and i != ' ':
                ans += i
                question += '_'

            else:
                question += i

        # if there is debugging it is prob due to this
        # check for 0 scramble ------------> make sure title of song is at least 5 letters long and the number of characters - spaces is at least more than 3

        while len(ans) == 0:

            x = random.randint(0, len(question)-1)

            if question[x] == ' ':
                continue

            ans += question[x]
            question = question[:x] + '_' + question[x+1:]


        # at least 3/5 characters should be filled in 

        while (len(question) - question.count('_')) < (3 * len(self.question) // 5):

            # find xth occurence of _ replace with xth char of ans

            x = random.randint(0, len(ans)-1)
            j = -1 # since the first occurence will relate to index 0
            for index in range(len(question)):
                if question[index] == '_': j += 1
                if j == x:
                    break

            question = question[:index] + ans[x] + question[x+1:] # replace _ with char
            ans = ans[:x] + ans[x+1:] # remove char from ans


        return question, ans


# load questions + scores

file = open('questions.pickle', 'rb')
Question.Instances = pickle.load(file)
file.close()

global Scores
file = open('scores.pickle', 'rb')
Scores = pickle.load(file)
file.close()

print(Scores)

# Add way more songs 

Question('Thriller','Michael Jackson')
Question('Like a Prayer', 'Madonna')
Question('Yummy','Justin Bieber')
Question('Break my heart','Dua Lipa')
Question('Old Town Road','Lil Nas X')
Question('Bad Guy','Billie Eilish')
Question('Juice','Lizzo')
Question('Dance Monkey','Tones and I')
Question('Baby one more time','Britney Spears')
Question('Call Me Maybe','Carly Rae Jespen')
Question('Feel Good Inc','Gorillaz')
Question('Bohemian Rhapsody','Queen')
Question('Around the world','Daft Punk')
Question('I want to break free','Queen')
Question('Smells like teen spirit','Nirvana')
Question('What a wonderful world','Louis Armstrong')
Question('Dont worry be happy','Bobby McFerrin')


@app.route('/get_all_questions', methods = ['POST'])
def get_all_questions():
    return jsonify({'names':[key for key in Question.Instances]})


@app.route('/edit_question', methods = ['POST'])
def edit_question():
    data = request.get_json()

    q_name = data['q_name']
    q = Question.Instances[q_name]
    new_name = data['new_name']
    Question.Instances[new_name] = q
    del Question.Instances[q_name]

    return 0

@app.route('/del_question', methods = ['POST'])
def del_question():
    data = request.get_json()

    q_name = data['q_name']
    del Question.Instances[q_name]

    return 0

@app.route('/admin')
def admin(): 
    return render_template('admin.html')


@app.route('/get_leaderboard', methods = ['POST'])
def get_leaderboard():
    ''' return top x scorers '''

    global Scores

    if 'first' in request.get_json(): 
        return jsonify({'scores': Scores[0]})
    return jsonify({'scores': Scores})


@app.route('/get_question', methods = ['POST'])
def get_question():
    ''' use the scramble method for now '''

    #!question = Question.Instances[random.randint(0,len(Question.Instances)-1)]
    question = Question.Instances[random.choice(list(Question.Instances.keys()))]
    scr_question, scr_answer = question.scramble() # scrambled question , scrambled answer

    return jsonify({'question': scr_question, 'answer': scr_answer, 'artist': question.artist})


@app.route('/add_question', methods = ['POST'])
def add_question():
    data = request.get_json()
    title, artist = data['title'], data['artist']

    if len(title) <= 5:
        to_return = {'valid': 'song name must be longer than 5 characters'}

    elif title.count(' ') > len(title) // 2:
        to_return = {'valid': 'song name contains too many spaces'}
        
    elif title in Question.Instances:
        to_return = {'valid': 'song already exists in database'}
        
    else:
        Question(title, artist)
        to_return = {'valid': 'song successfully added to database'}

    return jsonify(to_return)



@app.route('/send_score', methods = ['POST'])
def send_score():
    global Scores, scoreCap
    data = request.get_json()

    score = int(data['score'])
    name = data['name']

    i = scoreCap - 1
    while score >= Scores[i][0]:
        i -= 1
        if i == -1:
            break

    Scores.insert(i+1, [score, name])

    Scores = Scores[:scoreCap]
    # rewrite scores db

    file = open('scores.pickle', 'wb')
    pickle.dump(Scores, file)
    file.close()

    print('------ SCORES ------')
    print(Scores)

    return jsonify({})


@app.route('/')
def index():
    return render_template('index.html')

app.run(debug = True, host = '0.0.0.0', port = 8000)
