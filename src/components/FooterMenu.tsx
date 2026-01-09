import React, { FC } from 'react';
import './FooterMenu.scss';

interface FooterMenuProps {
  winner: string | null;
  currentPlayer: string;
  isDraw: boolean;
  resetFunc: () => void;
  onExit: () => void;
}

const FooterMenu: FC<FooterMenuProps> = ({ winner, currentPlayer, isDraw, resetFunc, onExit }) => {
  return (
    <div className="footerMenu">
      <div className="footerMenu__cont">
        <h2 className="footerMenu__header">Крестики-нолики</h2>

        <div className="footerMenu__body">
          {winner && (
            <p className="footerMenu__status">
              Победитель: <strong>{winner}</strong>
            </p>
          )}
          {!winner && !isDraw && (
            <p className="footerMenu__status">
              Ход: <strong>{currentPlayer}</strong>
            </p>
          )}
          {isDraw && <p className="footerMenu__status">Ничья</p>}

          <button className="footerMenu__reset" onClick={resetFunc}>
            Сбросить
          </button>
        </div>
      </div>

      <div className="footerMenu__back">
        <button type="button" className="footerMenu__backBtn" onClick={onExit}>
          Назад
        </button>
      </div>
    </div>
  );
};

export default FooterMenu;
