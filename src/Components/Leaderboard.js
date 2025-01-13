import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Leaderboard.css';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

const Leaderboard = ({ showTopN = 10 }) => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [leaderboardType, setLeaderboardType] = useState('global'); // 'global', 'personal', or 'search'
    const [searchedUsername, setSearchedUsername] = useState(''); // Input value
    const [usernameToSearch, setUsernameToSearch] = useState(''); // Username to fetch data for
    const navigate = useNavigate();

    const loggedInUsername = localStorage.getItem('username') || 'Unknown';
    const lastGameFinishedAt = localStorage.getItem('lastGameFinishedAt');

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                let response;
                if (leaderboardType === 'global') {
                    response = await axios.get('http://localhost:3001/leaderboard/global', {
                        params: { topN: showTopN },
                    });
                } else if (leaderboardType === 'personal') {
                    response = await axios.get('http://localhost:3001/leaderboard/personal', {
                        params: { username: loggedInUsername, topN: showTopN },
                    });
                } else if (leaderboardType === 'search' && usernameToSearch) {
                    response = await axios.get('http://localhost:3001/leaderboard/personal', {
                        params: { username: usernameToSearch, topN: showTopN },
                    });
                } else {
                    setLeaderboardData([]);
                    setErrorMessage('');
                    return;
                }
                setLeaderboardData(response.data);
                setErrorMessage('');
            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
                setErrorMessage('Failed to load leaderboard data.');
            }
        };

        fetchLeaderboardData();
    }, [leaderboardType, showTopN, loggedInUsername, usernameToSearch]);

    const goBack = () => {
        navigate(-1); // Navigate back to the previous page
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setUsernameToSearch(searchedUsername.trim());
    };

    return (
        <div className="leaderboard-page">
            <h1>Leaderboards</h1>
            <div className="back-btn-container">
                <button className="back-btn" onClick={goBack}>
                    <i className="bi bi-arrow-left"></i> 
                </button>
            </div>
            <div className="leaderboard-switch">
                <Button
                    className={`btn-custom ${leaderboardType === 'global' ? 'active' : ''}`}
                    onClick={() => {
                        setLeaderboardType('global');
                        setUsernameToSearch('');
                        setSearchedUsername('');
                    }}
                >
                    Global Leaderboard
                </Button>
                <Button
                    className={`btn-custom ${leaderboardType === 'personal' ? 'active' : ''}`}
                    onClick={() => {
                        setLeaderboardType('personal');
                        setUsernameToSearch('');
                        setSearchedUsername('');
                    }}
                >
                    My Leaderboard
                </Button>
                <Button
                    className={`btn-custom ${leaderboardType === 'search' ? 'active' : ''}`}
                    onClick={() => {
                        setLeaderboardType('search');
                        setUsernameToSearch('');
                        setSearchedUsername('');
                    }}
                >
                    Search
                </Button>
            </div>
            {leaderboardType === 'search' && (
                <form onSubmit={handleSearchSubmit} className="search-form">
                    <input
                        type="text"
                        value={searchedUsername}
                        onChange={(e) => setSearchedUsername(e.target.value)}
                        placeholder="Enter username to search"
                        className="search-input"
                    />
                    <Button type="submit" className="btn-custom search-button">Search</Button>
                </form>
            )}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>Score</th>
                        <th>Result</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboardData.length > 0 ? (
                        leaderboardData.map((entry, index) => {
                            let isHighlighted = false;

                            if (leaderboardType === 'global') {
                                // Highlight only the game just played
                                isHighlighted =
                                    entry.username === loggedInUsername &&
                                    entry.finished_at === lastGameFinishedAt;
                            }

                            return (
                                <tr key={index} className={isHighlighted ? 'current-user' : ''}>
                                    <td>{index + 1}</td>
                                    <td>{entry.username}</td>
                                    <td>{entry.score}</td>
                                    <td>{entry.won}</td>
                                    <td>{new Date(entry.finished_at).toLocaleString()}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5">
                                {leaderboardType === 'search' && usernameToSearch
                                    ? `No data available for "${usernameToSearch}".`
                                    : leaderboardType === 'personal'
                                    ? `No data available for "${loggedInUsername}".`
                                    : 'No data available.'
                                }
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;
