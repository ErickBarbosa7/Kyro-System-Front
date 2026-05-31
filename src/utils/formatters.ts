import { AsYouType, parsePhoneNumberFromString } from 'libphonenumber-js';


// Metodo para formatear un número de teléfono a un formato internacional  (ej. +52 415 232 1222)
export const formatPhone = (phone?: string): string => {
    if (!phone) return '-';
    // Ponemos 'MX' como país por defecto si el usuario no escribió el '+'
    const phoneNumber = parsePhoneNumberFromString(phone, 'MX');

    if (phoneNumber && phoneNumber.isValid()) {
        // Devuelve el formato  (ej. +52 415 232 1222)
        return phoneNumber.formatInternational(); 
    }
    // Si el número es muy raro o inválido, lo devolvemos tal cual para no perder datos
    return phone;
};

// Metodo para formatear el input de teléfono mientras el usuario escribe (en el formulario)
export const formatPhoneInput = (value: string): string => {
    if (!value) return '';

    // 'MX' hace que si escribes "415...", asuma que es de México.
    // Pero si escribes "+1 305...", se cambia automáticamente a Estados Unidos.
    const formatter = new AsYouType('MX');
    
    return formatter.input(value);
};