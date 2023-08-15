import {setErrorAC, setStatusAC} from "../app/app-reducer";
import {Dispatch} from "redux";
import {ResponseType} from "../api/todolists-api";


export const handleServerNetworkError = (dispatch: Dispatch, error: string) => {
    dispatch(setErrorAC(error))
    dispatch(setStatusAC('failed'))
}
//http-ошибка, по сути, это когда запрос на сервер мы отправили, а сети вовсе нет (Network Error)
// и падает ошибка, либо сервер возвращает осознанно ответ со статусом отличным от 2XX-диапазона)

export const handleServerAppError = <T>(dispatch: Dispatch, data: ResponseType<T>) => {
    //прокидываем ResponseType который является дженериком
    //ResponseType уточняем дженериками
    //=<T> указание на дженерик которым ты в момент вызова функции будешь подменять с ResponseType<T>
    const error = data.messages[0]//достань ошибку
    if(error) {//если ошибка есть
        dispatch(setErrorAC(error))
    } else {//если ошибки нет засетай дефолтную
        dispatch(setErrorAC('some error'))
    }
    dispatch(setStatusAC('failed'))
}
//3^13
type User = {
    age: number
    name: string
}
const user = {
    age: 44,
    name: 'Jack'
}
const test = (arg: User | User[] | Function | number): User | User[] | Function | number => {
    //функция тест принимает аргумент
//в качестве параметров может прийти или User или массив юзеров или функция или число
    return arg
    //широкий выбор того что может ретурнуть
}

function identity<T>(arg:T): T { //принимается динамический тип
    return arg //возвращается динамический тип
}

const res1 = test(user)
const res2 = identity(user)
//будет понимать что res2 это объект у которого есть age name

const res3 = identity<User>(user)
//можем явно указать тип данных