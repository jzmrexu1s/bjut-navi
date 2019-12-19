//
// Created by Chengwei Zhang on 2019-12-19.
//

#ifndef UNTITLED2_GRAPH_H
#define UNTITLED2_GRAPH_H

#endif //UNTITLED2_GRAPH_H

#define UNVISITED -1
#define VISITED 1
#define INFINITE 65535
#include "iostream"
#include "string"
#include <stack>
using namespace std;


class Edge{
public:
    int from, to, weight;
    Edge() {
        from = -1;
        to = -1;
        weight  = 0;
    }
    Edge(int f, int t, int w) {
        from = f;
        to = t;
        weight = w;
    }
};


class Graph{
public:
    int numVertex; // 顶点数
    int numEdge;
    int *Mark; // 是否被访问
    int *Indegree; // 入度
    explicit Graph(int numVert) {
        numVertex = numVert;
        numEdge = 0;
        Indegree = new int[numVertex];
        Mark = new int[numVertex];
        for(int i = 0; i < numVertex; i ++) {
            Mark[i] = UNVISITED;
            Indegree[i] = 0;
        }
    };
};

class Graphm: public Graph{
private:
    int * * matrix;
public:
    explicit Graphm(int numVert): Graph(numVert) {
        int i, j;
        matrix = (int * *)new int *[numVertex];
        for(i = 0; i < numVertex; i ++) {
            matrix[i] = new int[numVertex];
        }
        for(i = 0; i < numVertex; i ++) {
            for(j = 0; j < numVertex; j ++) {
                matrix[i][j] = INFINITE;
            }
        }
    }
    void setEdge(int from, int to, int weight) {
        if (matrix[from][to] <= 0) {
            numEdge ++;
            Indegree[to] ++;
        }
        matrix[from][to] = weight;
    }
    int * * getMatrix() {
        return matrix;
    }
};

class Dist{
public:
    int index; // 顶点的索引值
    int length; // 当前最短路径长度
    int pre; // 路径最后经过的顶点
};

void Floyd(Graphm& G, Dist * * &D) {
    int pointAmount = G.numVertex;
    D = new Dist * [pointAmount];
    for (int i = 0; i < pointAmount; i ++)
        D[i] = new Dist[pointAmount];
    for(int i = 0; i < pointAmount; i ++) {
        for(int j = 0; j < pointAmount; j ++) {
            D[i][j].length = G.getMatrix()[i][j];
            if (D[i][j].length == INFINITE)
                D[i][j].pre = -1;
            else
                D[i][j].pre = i;
        }
    } // i -> j

    int step = 0;
    while(step < pointAmount) {
        for(int i = 0; i < pointAmount; i ++) {
            for(int j = 0; j < pointAmount; j ++) {
                if((D[i][step].length + D[step][j].length) < D[i][j].length) {
                    D[i][j].length = D[i][step].length + D[step][j].length;
                    D[i][j].pre = D[step][j].pre;
                }
            }
        }
        step ++;
    }

    for(int i = 0; i < pointAmount; i ++) {
        for (int j = 0; j < pointAmount; j++) {
            if (D[i][j].length != INFINITE && i != j) {
                stack <int> road;
                cout << "从V" << i << "到V" << j << "的路径：";
                road.push(j);
                int nowPoint = D[i][j].pre;
                road.push(nowPoint);
                while (nowPoint != i) {
                    nowPoint = D[i][nowPoint].pre;
                    road.push(nowPoint);
                }
                while(!road.empty()) {
                    cout << 'V' << road.top();
                    if (road.top() != j)
                        cout << " -> ";
                    road.pop();
                }
                cout << "   长度：" << D[i][j].length << endl;
            }
        }
    }
}

int main() {
    int pointAmount;
    int edgeAmount;
    cout << "输入节点数：" << endl;
    cin >> pointAmount;
    cout << "输入边数：" << endl;
    cin >> edgeAmount;
    Graphm newGraph(pointAmount);
    for (int i = 1; i < edgeAmount + 1; i ++) {
        int in;
        int out;
        int weight;
        cout << "输入第" << i << "条边的始点，终点，权：" << endl;
        cin >> in >> out >> weight;
        newGraph.setEdge(in, out, weight);
    }

    Dist** dist;
    Floyd(newGraph, dist);
    return 0;
}