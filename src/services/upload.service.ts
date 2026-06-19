import kyroApi from '../api/kyroApi';

export const subirImagen = async (file: File, folder: string = 'piezas'): Promise<string> => {
    const formData = new FormData();
    formData.append('imagen', file);
    const { data } = await kyroApi.post(`/upload/${folder}-imagen`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
};
