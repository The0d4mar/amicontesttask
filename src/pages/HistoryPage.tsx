import React, { FC, useMemo, useState } from 'react';
import './HistoryPage.scss';
import { loadHistory } from '../game/storage';
import MatchViewer from '../components/MatchViewer';
import { useNavigate } from 'react-router-dom';

interface HistoryPageProps {}

const HistoryPage: FC<HistoryPageProps> = () => {
  const navigate = useNavigate();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const matches = useMemo(() => {
    const data = loadHistory();
    return [...data].sort((a, b) => b.finishedAt - a.finishedAt);
  }, []);


  const selectedMatch = useMemo(() => {
    if (!selectedMatchId) return null;
    return matches.find((m) => m.id === selectedMatchId) ?? null;
  }, [matches, selectedMatchId]);

  return (
    <div className="historyPage">
      <header className="historyPage__header">
        <button className="historyPage__backBtn" onClick={() => navigate('/')}>
          На главную
        </button>
      </header>

      <h2 className="historyPage__title">История игр</h2>
      {matches.length === 0 ? (
        <p className="historyPage__empty">Сохранённых матчей нет.</p>
      ) : (
        <ul className="historyPage__list">
          {matches.map((m) => (
            <li key={m.id} className="historyPage__item">
              <button
                className="historyPage__itemBtn"
                onClick={() => setSelectedMatchId(m.id)}
                type="button"
              >
                <div className="historyPage__itemMain">
                  <div className="historyPage__itemWinner">
                    Победитель: <b>{m.winner}</b>
                  </div>
                  <div className="historyPage__itemMeta">Ходов: {m.moves.length}</div>
                </div>

                <div className="historyPage__itemDate">
                  {new Date(m.finishedAt).toLocaleString()}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedMatch && (
        <MatchViewer match={selectedMatch} onClose={() => setSelectedMatchId(null)} />
      )}
    </div>
  );
};

export default HistoryPage;
