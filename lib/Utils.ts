export function listMultiply<T>(list: T[], num: number): T[] {
    let retList: T[] = [];
    for (let i = 0; i < num; i++) {
        for (let j = 0; j < list.length; j++) {
            retList.push(list[j]);
        }
    }
    return retList;
}