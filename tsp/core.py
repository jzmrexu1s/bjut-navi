class Solution:
    def __init__(self, lengths, start_spot):
        self.lengths = lengths
        self.start_spot = start_spot
        self.saved = [0] * (2 ** (len(lengths)))
        self.spots = [i for i in range(len(lengths)) if i != start_spot]

    def to_binary(self, spots):
        b = 0
        for s in spots:
            b = b + 2 ** s
        return b

    def search_step(self, spots, target):
        if spots:
            min_distance = 99999
            min_idx = 0
            for spot in spots:
                removed = spots[:]
                removed.remove(spot)
                distance = self.search_step(removed, spot) + self.lengths[spot][target]
                if distance < min_distance:
                    min_distance = distance
                    min_idx = spot
            b = self.to_binary(spots)
            self.saved[b] = min_idx
            return min_distance
        else:
            return self.lengths[self.start_spot][target]

    def search(self):
        return self.search_step(self.spots, self.start_spot)

    def get_seq_step(self, spots, seq):
        if spots:
            next_spot = self.saved[self.to_binary(spots)]
            spots.remove(next_spot)
            seq.append(next_spot)
            self.get_seq_step(spots, seq)

    def get_seq(self):
        seq = [self.start_spot]
        self.get_seq_step(self.spots, seq)
        seq.append(self.start_spot)
        seq = seq[::-1]
        return seq

    def run(self):
        self.search()
        return self.get_seq()

def make_solution(lengths):
    start_spot = 0
    s1 = Solution(lengths, start_spot)
    seq = s1.run()
    seq = [s + 1 for s in seq]
    return seq


if __name__ == "__main__":
    # 测试：lengths = [[-1, 2, 5, 7], [2, -1, 8, 3], [5, 8, -1, 1], [7, 3, 1, -1]]
    print("输入点数量：")
    lst = []
    n = int(input())
    print("请输入各点间距离，到自身的距离用-1表示，每个距离间用空格分割，按回车完成。")
    for i in range(n):
        print("按顺序输入第", i + 1, "个点到其余各点的距离：")
        l = list(map(int, input().split()))
        assert len(l) == n
        lst.append(l)
    print("TSP最优路径如下：")
    print(" -> ".join(map(str, make_solution(lst))))
