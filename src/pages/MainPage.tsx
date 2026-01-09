import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import './MainPage.scss';

interface MainPageProps {}
const MainPage: FC<MainPageProps> = () => {
  return (
    <div className="mainPage">
      <div className="mainPage__cont">
        <div className="mainPage__header">
          <h1>Крестики-нолики</h1>
        </div>
        <div className="mainPage__body">
          <Link to={'/gamepage'} className="mainPage__navigBtn">
            Начать игру
          </Link>
          <Link to={'/history'} className="mainPage__navigBtn">
            История игр
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
