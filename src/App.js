
import './App.css';
import { useEffect, useState } from 'react';

// girouxs id /api/v1/people/8473512

function App() {

  const [nextGame, setNextGame] = useState({
    home: '',
    away: ''
  })

  const [flaStats, setFlaStats] = useState({
    gp: 0,
    goals: 0,
    assists: 0,
    points: 0,
    faceOffPct: 0,
    avgTimeOnIce: 0,
    plusMinus: 0
  })

  const [lastGameStats, setLastGameStats] = useState({
    goals: 0,
    assists: 0,
    points: 0,
    faceOffPct: 0,
    timeOnIce: 0,
    plusMinus: 0
  })

  const [lastGame, setLastGame] = useState({
    periods: [{startTime: ''}],
    teams: {
      away: {
        goals: 0,
        team: {
          name: ''
        }
      }, 
      home: {
        goals: 0,
        team: {
          name: ''
        }
      }
    }
  })

  async function getData() {
    fetch('https://statsapi.web.nhl.com/api/v1/people/8473512/stats?stats=gameLog&season=20212022').then((res) => {
      return res.json();
    }).then((data) => {
      const flaGames = data.stats[0].splits.filter((game) => game.team.id == 13);
      console.log(flaGames);
      setFlaStats(getStatsFromGames(flaGames));
      const lastGamesStats = flaGames[0];
      
      fetch(`https://statsapi.web.nhl.com/api/v1/game/${lastGamesStats.game.gamePk}/linescore`).then((res) => {
        return res.json();
      }).then ((data) => {
        setLastGame(data)
      })
    
      setLastGameStats(getLastGameInfo(lastGamesStats))
    })
    fetch('https://statsapi.web.nhl.com/api/v1/teams/13?expand=team.schedule.next').then((res) => {
      return res.json();
    }).then((data) => {
      const nextGameInfo = {};
      nextGameInfo.home = data.teams[0].nextGameSchedule.dates[0].games[0].teams.home.team.name;
      nextGameInfo.away = data.teams[0].nextGameSchedule.dates[0].games[0].teams.away.team.name;
      const dateTime = new Date(data.teams[0].nextGameSchedule.dates[0].games[0].gameDate);
      nextGameInfo.date = dateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const time = dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      nextGameInfo.time = time;
      console.log(nextGameInfo)
      console.log(data);
      setNextGame(nextGameInfo);
    })
  }

  function getLastGameInfo(lastGame) {
    let goals = lastGame.stat.goals;
    let assists = lastGame.stat.assists;
    let points = goals + assists;
    let faceOffPct = lastGame.stat.faceOffPct;
    let timeOnIce = lastGame.stat.timeOnIce;
    let plusMinus = lastGame.stat.plusMinus > 0 ? `+${lastGame.stat.plusMinus}` : lastGame.stat.plusMinus;
    return {goals, assists, points, faceOffPct, timeOnIce, plusMinus};
  }

  function getStatsFromGames(gamesArr) {
    let gp = gamesArr.length;
    let goals = 0;
    let assists = 0;
    let totFaceOffPct = 0;
    let totTimeOnIceSeconds = 0;
    let plusMinus = 0;

    gamesArr.forEach((game) => {
      goals += game.stat.goals;
      assists += game.stat.assists;
      totFaceOffPct += game.stat.faceOffPct;
      plusMinus += game.stat.plusMinus;
      let timeOnIce = game.stat.timeOnIce.split(':').map(n => Number(n));
      totTimeOnIceSeconds += (timeOnIce[0] * 60 + timeOnIce[1]);
    })
   
    const avgFaceOffPct = Math.round(((totFaceOffPct / gp)+ Number.EPSILON) * 100) / 100;

    const avgTimeOnIceSeconds = totTimeOnIceSeconds / gp;
    let seconds = Math.round(avgTimeOnIceSeconds % 60).toString();
    let minutes = Math.round((avgTimeOnIceSeconds - seconds) / 60).toString();

    if (seconds.length === 1) {
      seconds = "0" + seconds;
    }

    if (minutes.length === 1) {
      minutes = "0" + minutes;
    }

    const avgTimeOnIce = minutes + ':' + seconds;

    const points = goals + assists;
    const pointsPerGame = Math.round(((points / gp )+ Number.EPSILON) * 100) / 100;

    
    return {gp, goals, assists, avgFaceOffPct, plusMinus, avgTimeOnIce, points, pointsPerGame}
  }



  useEffect(() => {
    getData();
  }, [])

  return (
    <div className="App">
      <h1>Claude Giroux <span className='number'>#28</span></h1>
      Latest Game {new Date(lastGame.periods[0].startTime).toLocaleDateString("en-US")}
      <div className='lastGame'>
        <table className='scoreboard'>
          <tbody>
            <tr>
              <td className='teamName'>{lastGame.teams.away.team.name}</td><td className='score'>{lastGame.teams.away.goals}</td>
            </tr>
            <tr>
              <td className='teamName'>{lastGame.teams.home.team.name}</td><td className='score'>{lastGame.teams.home.goals}</td>
            </tr>
          </tbody>
        </table>
        <table className='lastGameStats'>
          <tbody>
            <tr>
              <th>G</th>
              <th>A</th>
              <th>P</th>
              <th>+/-</th>
              <th>FO %</th>
              <th>TOI</th>
            </tr>
            <tr>
              <td>{lastGameStats.goals}</td>
              <td>{lastGameStats.assists}</td>
              <td>{lastGameStats.points}</td>
              <td>{lastGameStats.plusMinus}</td>
              <td>{lastGameStats.faceOffPct}</td>
              <td>{lastGameStats.timeOnIce}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>As a Florida Panther...</div>
      <div className='flaStats'>
        
        <div>
          <span className='stat'>{flaStats.gp}</span>
          <span className='label'>GAMES PLAYED</span>
        </div>
        <div>
          <span className='stat'>{flaStats.goals}</span>
          <span className='label'>GOALS</span>
        </div>
        <div>
          <span className='stat'>{flaStats.assists}</span>
          <span className='label'>ASSISTS</span>
        </div>
        <div>
          <span className='stat'>{flaStats.points}</span>
          <span className='label'>POINTS</span>
        </div>
        <div>
          <span className='stat'>{flaStats.pointsPerGame}</span>
          <span className='label'>POINTS PER GAME</span>
        </div>
        <div>
          <span className='stat'>{flaStats.plusMinus > 0 ? `+${flaStats.plusMinus}` : flaStats.plusMinus}</span>
          <span className='label'>PLUS/MINUS</span>
        </div>
        <div>
          <span className='stat'>{flaStats.avgFaceOffPct}%</span>
          <span className='label'>FACE OFF WINS</span>
        </div>
        <div>
          <span className='stat'>{flaStats.avgTimeOnIce}</span>
          <span className='label'>AVERAGE TIME ON ICE</span>
        </div>
        
      </div>
      Next Game
      <div className='nextGame'>
        <div>
          <div>{nextGame.away}</div><div>{nextGame.home}</div>
        </div>
        <div className='dateTime'>
          <div>{nextGame.date}</div><div>{nextGame.time} ET</div>
        </div>
      </div>
    </div>
  );
}

export default App;
