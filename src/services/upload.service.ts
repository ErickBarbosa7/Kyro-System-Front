import kyroApi from '../api/kyroApi';

const folderMap: Record<string, string> = {
    piezas: 'pieza',
};

export const subirImagen = async (file: File, folder: string = 'piezas'): Promise<string> => {
    const formData = new FormData();
    formData.append('imagen', file);
    const endpoint = folderMap[folder] || folder;
    const { data } = await kyroApi.post(`/upload/${endpoint}-imagen`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
};
