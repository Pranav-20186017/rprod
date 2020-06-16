"""
Generates results.json and keys.txt
"""
import json
import random as r
import string
import pprint as pp

subjects = dict()


for i in range(8):
    sub_code = ''.join(r.choices(string.digits, k=5))
    sub_name = ''.join(r.choices(string.ascii_uppercase + ' ', k=40)).strip()
    credits = ''.join(r.choices('0234', k=1))
    subjects[sub_code] = {'name': sub_name, 'credits': credits}

json_ = """{
            "17P71A1215":{
                name : 
                fname: 
                ccode:
                marks: [
                    sub_code1:  {
                        name: name,
                        grade: grade, 
                        cresits: credits
                    },
                    sub_code1:  {
                        name: name,
                        grade: grade, 
                        cresits: credits
                    },sub_code1:  {
                        name: name,
                        grade: grade, 
                        cresits: credits
                    },sub_code1:  {
                        name: name,
                        grade: grade, 
                        cresits: credits
                    },sub_code1:  {
                        name: name,
                        grade: grade, 
                        cresits: credits
                    }
                ]
            }
        """
# pp.pprint(subjects)

LIMIT = 1000000
alpha = string.ascii_uppercase
data = {}
keys_fp = open('keys_million.txt', 'w')

for i in range(LIMIT):
    print(i)
    htno = ''.join(r.choices(alpha + string.digits, k=10))
    name = ''.join(r.choices(alpha + ' ', k=20)).strip()
    fname = ''.join(r.choices(alpha + ' ', k=20)).strip()
    keys_fp.write(htno + '\n')

    marks = subjects

    for sub in marks:
        marks[sub]['grade'] = ''.join(r.choices('FABCDEO', k=1))

    data[htno] = {
        'Name': name,
        'HTNO': htno,
        'FatherName': fname,
        'Marks': marks
    }
    # break
keys_fp.close()


with open('results_million.json', 'w') as outfile:
    json.dump(data, outfile)
