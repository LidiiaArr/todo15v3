export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
//не булеан чтобы было расширяемо

const initialState = {
    status: 'loading' as RequestStatusType,
    error: null as null | string
}//статус может быть одним из RequestStatusType
type InitialStateType = typeof initialState

export const appReducer = (state: InitialStateType =  initialState, action: ActionsType) : InitialStateType => {
    switch(action.type) {
        case 'APP/SET-STATUS':
            return {...state, status: action.status}
        case 'APP/SET-ERROR':
            return {...state, error: action.err}
        default:
            return state
    }
}

export const setStatusAC = (status: RequestStatusType) => ({type: 'APP/SET-STATUS', status} as const)
export type SetStatusType = ReturnType<typeof setStatusAC>

export const setErrorAC = (err: null | string) => ({type: 'APP/SET-ERROR', err} as const)
export type SetErrorType = ReturnType<typeof setErrorAC>


type ActionsType = SetStatusType | SetErrorType
//any - что хочешь
let num: any;
const test = num + 1
//unknown перед использованием надо протипизировать
let num1: unknown;
const test1 = (num1 as number) + 1

