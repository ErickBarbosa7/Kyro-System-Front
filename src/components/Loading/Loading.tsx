import { Player } from '@lottiefiles/react-lottie-player';
import animacionLoading from '../../assets/loading.json';
import './Loading.css';

export const Loading = ({ texto = "Cargando..." }) => {
    return (
        <div className="loading-container">
            <Player 
                autoplay
                loop
                src={animacionLoading}
                className="loading-player"
                speed={1.5}
            />

            <p className="loading-text">{texto}</p>
        </div>
    );
};