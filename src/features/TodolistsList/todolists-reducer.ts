import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, setErrorAC, SetErrorType, setStatusAC, SetStatusType} from "../../app/app-reducer";
import {handleServerAppError} from "../../utils/error-utils";

const initialState: Array<TodolistDomainType> = []

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'REMOVE-TODOLIST':
            return state.filter(tl => tl.id !== action.id)
        case 'ADD-TODOLIST':
            return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
        case 'CHANGE-TODOLIST-TITLE':
            return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
        case 'CHANGE-TODOLIST-FILTER':
            return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
        case 'SET-TODOLISTS':
            return action.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        case 'SET-ENTITY-STATUS-TODOLIST':
            return state.map((td) => td.id === action.id ? {...td,entityStatus: action.status}: td)
        default:
            return state
    }
}

// actions
export const removeTodolistAC = (id: string) => ({type: 'REMOVE-TODOLIST', id} as const)
export const addTodolistAC = (todolist: TodolistType) => ({type: 'ADD-TODOLIST', todolist} as const)
export const changeTodolistTitleAC = (id: string, title: string) => ({
    type: 'CHANGE-TODOLIST-TITLE',
    id,
    title
} as const)
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => ({
    type: 'CHANGE-TODOLIST-FILTER',
    id,
    filter
} as const)
export const setTodolistsAC = (todolists: Array<TodolistType>) => ({type: 'SET-TODOLISTS', todolists} as const)

export const setEntityStatusTodolistAC = (id: string, status: RequestStatusType) => ({type:'SET-ENTITY-STATUS-TODOLIST', id, status} as const)

// thunks
export const fetchTodolistsTC = () => {
    return (dispatch: Dispatch<ActionsType>) => {
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(setTodolistsAC(res.data))
            }).catch((e) => {})
        //первый запрос состояние загрузки поэтому
            .finally(()=> {
                dispatch(setStatusAC('idle'))
            })
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: Dispatch<ActionsType>) => {
        dispatch(setStatusAC('loading'))
        dispatch(setEntityStatusTodolistAC(todolistId,'loading'))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                if(res.data.resultCode === 0){ //если ошибки нет делаем
                    dispatch(removeTodolistAC(todolistId))
                    dispatch(setStatusAC('succeeded'))
                } else { //есть ошибка
                    const error = res.data.messages[0]
                    if(error) {
                        dispatch(setErrorAC(error))
                    } else { //если поле пустое
                        dispatch(setErrorAC('some error'))
                    }
                    dispatch(setStatusAC('failed'))

                }
            })
            .catch((e) => {
                dispatch(setErrorAC(e.message))
                dispatch(setEntityStatusTodolistAC(todolistId,'failed'))
                dispatch(setStatusAC('failed'))

            })
        //если промис реджекиться мы попадаем в catch
        //catch принимает ошибку
    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch<ActionsType>) => {
        dispatch(setStatusAC('loading'))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                console.log(res)
                if(res.data.resultCode === 0){
                    dispatch(addTodolistAC(res.data.data.item))
                } else {
                    handleServerAppError(dispatch, res.data)
                }
            })
            .catch()
            .finally(()=> {
                dispatch(setStatusAC('succeeded'))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch<ActionsType>) => {
        dispatch(setStatusAC('loading'))
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeTodolistTitleAC(id, title))
                dispatch(setStatusAC('succeeded'))
            })
    }
}

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
type ActionsType =
    | RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodolistTitleAC>
    | ReturnType<typeof changeTodolistFilterAC>
    | SetTodolistsActionType
    | SetStatusType
    | ReturnType<typeof setEntityStatusTodolistAC>
    | SetErrorType

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
//
