import React, {FC} from 'react';
import './ResetGame.scss'

interface ResetGameProps{
    onCancel: () => void,
    onConfirm: () => void

}
const ResetGame:FC<ResetGameProps> = ({onCancel, onConfirm}) => {
  return (
    <div className='resetModal'>
        <h2 className='resetModal__header'>Вы уверены, что хотите обнулить игру?</h2>

        <div className='resetModal__btns'>
            <button className="resetModal__btn" onClick={onConfirm}>Да</button>
            <button className="resetModal__btn" onClick={onCancel}>Нет</button>
        </div>
      
    </div>
  );
};

export default ResetGame;