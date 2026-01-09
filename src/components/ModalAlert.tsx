import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import './ModalAlert.scss';

interface ModalAlertProps {
  onCancel: () => void;
}
const ModalAlert: FC<ModalAlertProps> = ({ onCancel }) => {
  return (
    <div className="modal">
      <div className="modal__cont">
        <h1 className="modal__header">Партия не закончена!</h1>
        <div className="modal__question">Вы уверены что хотите выйти?</div>
        <div className="modal__btns">
          <Link to={'/'} className="modal__btn modal__out">
            Выйти
          </Link>
          <button className="modal__btn" onClick={onCancel}>
            Продолжить игру
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAlert;
