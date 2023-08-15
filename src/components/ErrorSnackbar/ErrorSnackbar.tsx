import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import {useAppDispatch, useAppSelector} from "../../app/store";
import {setErrorAC} from "../../app/app-reducer";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const CustomizedSnackbars = () => {
    const error = useAppSelector((state)=> state.app.error)
    const dispatch = useAppDispatch()
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        //SyntheticEvent тот же эвент с доп полями
        if (reason === 'clickaway') {
            return;
        }
        dispatch(setErrorAC(null))
    };

    return (
            <Snackbar open={!!error} autoHideDuration={6000} onClose={handleClose}>
                {/*Snackbar это интерфейс взаимодействия с alert чтобы открыть или скрыть*/}
                {/*open скрыть или показать autoHideDuration в миллисекундах через сколько скрыть
                autoHideDuration дергает onClose через 6 секунд*/}
                {/*!! преобразуй в булевское значение*/}
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    {/*sx это как пропс*/}
                    {error}
                </Alert>
            </Snackbar>
    );
}