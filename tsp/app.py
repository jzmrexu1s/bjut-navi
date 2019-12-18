from flask import Flask, request
from flask_restful import reqparse, abort, Api, Resource
import json
from core import make_solution
from flask_cors import CORS
import numpy
import math
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
app = Flask(__name__)
CORS(app, supports_credentials=True)
api = Api(app)


class handleTimeSeq(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('timeSeq')
        args = parser.parse_args()
        print(args)
        ls = [int(l) for l in args['timeSeq'][1:-1].split(',')]
        ls = numpy.array(ls).reshape(int(math.sqrt(len(ls))), int(math.sqrt(len(ls))))
        s = json.dumps(make_solution(ls))
        return {'seq': s}, 201


class handleMail(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('time')
        parser.add_argument('routes')
        parser.add_argument('names')
        parser.add_argument('email')
        args = parser.parse_args()
        f = open('result.txt', 'w', encoding='gb18030')
        time = [l[1:-1] for l in args['time'][1:-1].split(',')]
        routes = [l[1:] for l in args['routes'][1:-1].split('],')]
        routes_t = []
        for r in routes:
            t = r.replace('"', '')
            t = t.replace(']', '')
            routes_t.append(t)
        routes = routes_t
        names = [l[1:-1] for l in args['names'][1:-1].split(',')]
        i = 0
        s = time[0]
        f.write(s)
        f.write('\r\n')
        time = time[1:]
        while i < len(routes):
            if i != len(routes) - 1:
                s = names[i] + " -> " + routes[i] + " -> " + names[i + 1] + "。" + time[i]
            else:
                s = names[i] + " -> " + routes[i] + " -> " + names[i + 1]
            i += 1
            f.write(s)
            f.write('\r\n')
        f.close()

        fromaddr = '1535909927@qq.com'
        password = 'pposjoovyjhshgjj'
        toaddrs = [args['email']]

        content = '路径规划结果'
        textApart = MIMEText(content)

        doc = 'result.txt'
        pdfApart = MIMEApplication(open(doc, 'rb').read())
        pdfApart.add_header('Content-Disposition', 'attachment', filename=doc)

        m = MIMEMultipart()
        m.attach(textApart)
        m.attach(pdfApart)
        m['Subject'] = '路径规划结果'

        try:
            server = smtplib.SMTP_SSL('smtp.qq.com', 465)
            server.login(fromaddr, password)
            server.sendmail(fromaddr, toaddrs, m.as_string())
            # print('success')
            server.quit()
        except smtplib.SMTPException as e:
            print('error:', e)

        return {'result': 'succeed'}, 201


api.add_resource(handleTimeSeq, '/getseq')
api.add_resource(handleMail, '/mail')


if __name__ == '__main__':
    app.run(debug=True)
