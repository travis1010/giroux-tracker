
import './App.css';
import { useEffect, useState } from 'react';


// girouxs id /api/v1/people/8473512

function App() {

  const [nextGame, setNextGame] = useState({
    home: '',
    away: ''
  })

  const [flaStats, setFlaStats] = useState({
    wins: 0,
    losses: 0,
    OTs: 0,
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

  const [playoffStats, setPlayoffStats] = useState({
    gp: 0,
    goals: 0,
    assists: 0,
    points: 0,
    faceOffPct: 0,
    avgTimeOnIce: 0,
    plusMinus: 0
  })

  const [currentStats, setCurrentStats] = useState({
    type: "playoffs",
    wins: 0,
    losses: 0,
    OTs: 0,
    gp: 0,
    goals: 0,
    assists: 0,
    points: 0,
    faceOffPct: 0,
    avgTimeOnIce: 0,
    plusMinus: 0
  })

  function getData() {
    fetch('https://statsapi.web.nhl.com/api/v1/people/8473512/stats?stats=gameLog&season=20212022').then((res) => {
      return res.json();
    }).then((data) => {
      const flaGames = data.stats[0].splits.filter((game) => game.team.id == 13);
      setFlaStats(getStatsFromGames(flaGames));
      const lastGamesStats = flaGames[0];
      /* ------------disabling this for playoffs----------------
      fetch(`https://statsapi.web.nhl.com/api/v1/game/${lastGamesStats.game.gamePk}/linescore`).then((res) => {
        return res.json();
      }).then ((data) => {
        setLastGame(data)
      })
    
      setLastGameStats(getLastGameInfo(lastGamesStats))
      */
    })
    fetch('https://statsapi.web.nhl.com/api/v1/teams/13?expand=team.schedule.next').then((res) => {
      return res.json();
    }).then((data) => {
      
      const nextGameInfo = {};
      nextGameInfo.home = data.teams[0].nextGameSchedule.dates[0].games[0].teams.home.team.name;
      nextGameInfo.away = data.teams[0].nextGameSchedule.dates[0].games[0].teams.away.team.name;
      const dateTime = new Date(data.teams[0].nextGameSchedule.dates[0].games[0].gameDate);
      nextGameInfo.date = dateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const time = dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: "America/New_York"});
      console.log(time);
      nextGameInfo.time = time;
      setNextGame(nextGameInfo);
    })

    //playoffs here
    fetch('https://statsapi.web.nhl.com/api/v1/people/8473512/stats?stats=statsSingleSeasonPlayoffs&season=20212022').then((res) => {
      return res.json();
    }).then((data) => {
      console.log(data);
    
      setPlayoffStats({
        type: "playoffs",
        gp: data.stats[0].splits[0].stat.games,
        goals: data.stats[0].splits[0].stat.goals,
        assists: data.stats[0].splits[0].stat.assists,
        points: data.stats[0].splits[0].stat.points,
        faceOffPct: data.stats[0].splits[0].stat.faceOffPct,
        avgTimeOnIce: data.stats[0].splits[0].stat.timeOnIcePerGame,
        plusMinus: data.stats[0].splits[0].stat.plusMinus,
        pointsPerGame: Math.round(((data.stats[0].splits[0].stat.points / data.stats[0].splits[0].stat.games )+ Number.EPSILON) * 100) / 100
      })
      setCurrentStats({
        type: "playoffs",
        gp: data.stats[0].splits[0].stat.games,
        goals: data.stats[0].splits[0].stat.goals,
        assists: data.stats[0].splits[0].stat.assists,
        points: data.stats[0].splits[0].stat.points,
        faceOffPct: data.stats[0].splits[0].stat.faceOffPct,
        avgTimeOnIce: data.stats[0].splits[0].stat.timeOnIcePerGame,
        plusMinus: data.stats[0].splits[0].stat.plusMinus,
        pointsPerGame: Math.round(((data.stats[0].splits[0].stat.points / data.stats[0].splits[0].stat.games )+ Number.EPSILON) * 100) / 100
      })
    })
    //most recent playoff game
    fetch('https://statsapi.web.nhl.com/api/v1/people/8473512/stats?stats=playoffGameLog&season=20212022').then((res) => {
      return res.json();
    }).then((data) => {
      console.log({data})
      const lastGamesStats = data.stats[0].splits[0];
      
      fetch(`https://statsapi.web.nhl.com/api/v1/game/${lastGamesStats.game.gamePk}/linescore`).then((res) => {
        return res.json();
      }).then ((data) => {
        setLastGame(data)
      })
    
      setLastGameStats(getLastGameInfo(lastGamesStats))
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
    console.log(gamesArr)
    let wins = 0;
    let losses = 0;
    let OTs = 0;
    let gp = gamesArr.length;
    let goals = 0;
    let assists = 0;
    let totFaceOffPct = 0;
    let totTimeOnIceSeconds = 0;
    let plusMinus = 0;

    gamesArr.forEach((game) => {
      if(game.isWin) {
        wins++;
      } else if(game.isOT) 
      {
        OTs++;
      }
      else {
        losses++;
      }
      goals += game.stat.goals;
      assists += game.stat.assists;
      totFaceOffPct += game.stat.faceOffPct;
      plusMinus += game.stat.plusMinus;
      let timeOnIce = game.stat.timeOnIce.split(':').map(n => Number(n));
      totTimeOnIceSeconds += (timeOnIce[0] * 60 + timeOnIce[1]);
    })
   
    const faceOffPct = Math.round(((totFaceOffPct / gp)+ Number.EPSILON) * 100) / 100;

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

    
    return {type: 'season', gp, goals, assists, faceOffPct, plusMinus, avgTimeOnIce, points, pointsPerGame, wins, losses, OTs}
  }

  function getBtnClass(type) {
    return currentStats.type == type ? ' selectedBtn' : '';
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

      
      <div className='statsContainer'>
        <div className='tabBtns'>
          <button className={'playoffBtn' + getBtnClass('playoffs')} onClick={()=> setCurrentStats(playoffStats)}>Playoffs</button>
          <button className={'seasonBtn' + getBtnClass('season')} onClick={()=> setCurrentStats(flaStats)}>Season</button>
        </div>
        <div className='flaStats'>
        
          <div>
            <span className='stat'>{currentStats.gp}</span>
            <span className='label'>GAMES PLAYED</span>
          </div>
          <div>
            <span className='stat'>{currentStats.goals}</span>
            <span className='label'>GOALS</span>
          </div>
          <div>
            <span className='stat'>{currentStats.assists}</span>
            <span className='label'>ASSISTS</span>
          </div>
          <div>
            <span className='stat'>{currentStats.points}</span>
            <span className='label'>POINTS</span>
          </div>
          <div>
            <span className='stat'>{currentStats.pointsPerGame}</span>
            <span className='label'>POINTS PER GAME</span>
          </div>
          <div>
            <span className='stat'>{currentStats.plusMinus > 0 ? `+${currentStats.plusMinus}` : currentStats.plusMinus}</span>
            <span className='label'>PLUS/MINUS</span>
          </div>
          <div>
            <span className='stat'>{currentStats.faceOffPct}%</span>
            <span className='label'>FACE OFF WINS</span>
          </div>
          <div>
            <span className='stat'>{currentStats.avgTimeOnIce}</span>
            <span className='label'>AVERAGE TIME ON ICE</span>
          </div>
        
        
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
