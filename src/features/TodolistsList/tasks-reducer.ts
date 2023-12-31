import {AddTodolistActionType, RemoveTodolistActionType, SetTodolistsActionType} from './todolists-reducer'
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {setErrorAC, SetErrorType, setStatusAC, SetStatusType} from "../../app/app-reducer";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import axios, {AxiosError} from "axios";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

const initialState: TasksStateType = {}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case 'REMOVE-TASK':
            return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id !== action.taskId)}
        case 'ADD-TASK':
            return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
        case 'UPDATE-TASK':
            return {
                ...state,
                [action.todolistId]: state[action.todolistId]
                    .map(t => t.id === action.taskId ? {...t, ...action.model} : t)
            }
        case 'ADD-TODOLIST':
            return {...state, [action.todolist.id]: []}
        case 'REMOVE-TODOLIST':
            const copyState = {...state}
            delete copyState[action.id]
            return copyState
        case 'SET-TODOLISTS': {
            const copyState = {...state}
            action.todolists.forEach(tl => {
                copyState[tl.id] = []
            })
            return copyState
        }
        case 'SET-TASKS':
            return {...state, [action.todolistId]: action.tasks}
        // case 'APP/SET-STATUS':
        //     console.log('task-reducer')
        //     return state
        default:
            return state
    }
}

// actions
export const removeTaskAC = (taskId: string, todolistId: string) =>
    ({type: 'REMOVE-TASK', taskId, todolistId} as const)
export const addTaskAC = (task: TaskType) =>
    ({type: 'ADD-TASK', task} as const)
export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
    ({type: 'UPDATE-TASK', model, todolistId, taskId} as const)
export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
    ({type: 'SET-TASKS', tasks, todolistId} as const)

// thunks
export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setStatusAC('loading'))
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            const action = setTasksAC(tasks, todolistId)
            dispatch(action)
            dispatch(setStatusAC('succeeded'))
        })
}
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setStatusAC('loading'))
    todolistsAPI.deleteTask(todolistId, taskId)
        .then(res => {
            const action = removeTaskAC(taskId, todolistId)
            dispatch(action)
            dispatch(setStatusAC('succeeded'))
        })
}
/////////////////////////// THEN CATCH
// export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
//     dispatch(setStatusAC('loading'))
//     todolistsAPI.createTask(todolistId, title)
//         .then(res => {
//             if(res.data.resultCode === 0) { //ответ сервера без ошибки
//                 const task = res.data.data.item
//                 const action = addTaskAC(task)
//                 dispatch(action)
//                 dispatch(setStatusAC('succeeded'))
//             } else { //ответ от сервера  с ошибкой
//                 handleServerAppError(dispatch, res.data)
//             }
//         })
//         .catch((e)=> { //
//             dispatch(setErrorAC(e.message))
//             dispatch(setStatusAC('failed'))
//         })//в каждой санки должен быть catch
// }
export const addTaskTC = (title: string, todolistId: string) => async (dispatch: Dispatch<ActionsType>) => {
    dispatch(setStatusAC('loading'))
    try{ //try catch js конструкция если промис реджекится или выкидывается исключение - попадаем в catch
        const res = await todolistsAPI.createTask(todolistId, title)
        if(res.data.resultCode === 0) {
            const task = res.data.data.item
            const action = addTaskAC(task)
            dispatch(action)
            dispatch(setStatusAC('succeeded'))
        } else {
            handleServerAppError(dispatch, res.data)
        }
    } catch (e) {
        if (axios.isAxiosError<ErrorType>(e)) {
            //делаем проверку у аксиоса есть метод для проверки ошибок
            // действительно ли эта ошибка была сгенерирована аксиусом
            //метод возвращает boolean
            const error = e.response? e.response.data.error : e.message
            handleServerNetworkError(dispatch, error)
        } else {
            handleServerNetworkError(dispatch, (e as ErrType).message)
        }
    }
}

type ErrType = {
    message: string
}
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch<ActionsType>, getState: () => AppRootStateType) => {
        dispatch(setStatusAC('loading'))
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }

        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                if(res.data.resultCode === RESULT_CODES.OK) {
                    const action = updateTaskAC(taskId, domainModel, todolistId)
                    dispatch(action)
                    dispatch(setStatusAC('succeeded'))
                } else {
                    const error = res.data.messages[0]
                    if(error) {
                        dispatch(setErrorAC(error))
                    } else {
                        dispatch(setErrorAC('some error'))
                    }
                    dispatch(setStatusAC('failed'))
                }
            })
            .catch((e:AxiosError<ErrorType> )=> {
                handleServerNetworkError(dispatch, e.message)
            })
    }

    enum RESULT_CODES {
        OK = 0,
        ERROR = 1,
        ERROR_CAPTCHA = 10
    } //енам это функция поля не перезаписываются
// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}
type ActionsType =
    | ReturnType<typeof removeTaskAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof updateTaskAC>
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodolistsActionType
    | ReturnType<typeof setTasksAC>
    | SetStatusType
    | SetErrorType


type ErrorType = {
    statusCode: 0,
    messages: [
        {
            messages: string
            field: string
        }
    ],
    error: string
}