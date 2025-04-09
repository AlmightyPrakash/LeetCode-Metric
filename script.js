const searchBtn = document.getElementById("search-btn");
const usernameInput = document.getElementById("username");

// Score display elements
const easyScore = document.getElementById("easy-score");
const mediumScore = document.getElementById("medium-score");
const hardScore = document.getElementById("hard-score");

searchBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    if (username) {
        fetchUserDetails(username);
    } else {
        alert("Please enter a username");
    }
});

async function fetchUserDetails(username) {
    const targetUrl = "https://leetcode.com/graphql/";
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    const myHeader = new Headers();
    myHeader.append("content-type", "application/json");

    const graphql = JSON.stringify({
        query: `
            query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                    username
                    submitStats {
                        acSubmissionNum {
                            difficulty
                            count
                        }
                    }
                }
            }
        `,
        variables: {
            username: username
        }
    });

    try {
        searchBtn.textContent = "Searching...";
        searchBtn.disabled = true;

        const response = await fetch(proxyUrl + targetUrl, {
            method: "POST",
            headers: myHeader,
            body: graphql
        });

        if (!response.ok) {
            throw new Error("Unable to fetch user details");
        }

        const data = await response.json();
        const user = data.data?.matchedUser;

        if (user) {
            const submissions = user.submitStats.acSubmissionNum;

            const easy = submissions.find(s => s.difficulty === "Easy")?.count || 0;
            const medium = submissions.find(s => s.difficulty === "Medium")?.count || 0;
            const hard = submissions.find(s => s.difficulty === "Hard")?.count || 0;

            easyScore.textContent = easy;
            mediumScore.textContent = medium;
            hardScore.textContent = hard;

            drawLeetcodePieChart(easy, medium, hard); // ✅ Show chart here
        } else {
            easyScore.textContent = "--";
            mediumScore.textContent = "--";
            hardScore.textContent = "--";
            alert("User not found on LeetCode");
        }

    } catch (error) {
        console.error(error);
        alert("An error occurred while fetching data.");
    } finally {
        searchBtn.textContent = "Search";
        searchBtn.disabled = false;
    }
}

// Chart rendering logic
let chartInstance = null;

function drawLeetcodePieChart(easy, medium, hard) {
    const ctx = document.getElementById('leetcodeChart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy(); 
    }

    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Easy', 'Medium', 'Hard'],
            datasets: [{
                label: 'Problems Solved',
                data: [easy, medium, hard],
                backgroundColor: [
                    'rgb(39, 110, 145)', 
                    'rgb(175, 194, 66)', 
                    'rgba(143, 39, 39, 0.83)'  
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });
}
