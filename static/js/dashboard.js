document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts object to store all chart instances
    const charts = {};
    
    // Initialize date pickers with default values
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    if (!startDateInput.value) {
        startDateInput.valueAsDate = thirtyDaysAgo;
    }
    
    if (!endDateInput.value) {
        endDateInput.valueAsDate = today;
    }
    
    // Get DOM elements
    const customerSelect = document.getElementById('customer-select');
    const fetchDataBtn = document.getElementById('fetch-data-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.dashboard-section');
    
    // Initialize responsive behavior
    function initResponsive() {
        // Handle section navigation for better mobile experience
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Remove active class from all links
                    navLinks.forEach(l => l.classList.remove('active'));
                    // Add active class to clicked link
                    this.classList.add('active');
                    
                    // Scroll to section with offset for fixed header
                    const offset = window.innerWidth <= 992 ? 20 : 80;
                    const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Handle chart resizing on window resize
    function setupChartResizing() {
        // Resize all charts when window size changes
        window.addEventListener('resize', function() {
            // Add a small delay to ensure proper resizing after DOM updates
            setTimeout(function() {
                for (let chartName in charts) {
                    if (charts[chartName]) {
                        charts[chartName].resize();
                    }
                }
            }, 100);
        });

        // Also resize charts when sidebar is toggled (for mobile)
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', function() {
                // Add a small delay to ensure sidebar animation completes
                setTimeout(function() {
                    for (let chartName in charts) {
                        if (charts[chartName]) {
                            charts[chartName].resize();
                        }
                    }
                }, 300);
            });
        }
    }

    initResponsive();
    setupChartResizing();
    
    // Add event listeners
    fetchDataBtn.addEventListener('click', fetchData);
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get target section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            // Scroll to target section
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Fetch data from API
    async function fetchData() {
        const customerId = customerSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        if (!customerId || !startDate || !endDate) {
            alert('Please select an account and date range');
            return;
        }
        
        // Show loading overlay
        loadingOverlay.style.display = 'flex';
        
        try {
            const response = await fetch('/fetch_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customer_id: customerId,
                    start_date: startDate,
                    end_date: endDate
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            
            const data = await response.json();
            
            // Update dashboard with data
            updateDashboard(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Error fetching data: ' + error.message);
        } finally {
            // Hide loading overlay
            loadingOverlay.style.display = 'none';
        }
    }
    
    // Update dashboard with data
    function updateDashboard(data) {
        // Update summary metrics
        updateSummaryMetrics(data.summary);
        
        // Update charts
        createSummary3DChart(data);
        createDailyCharts(data.daily_data);
        createCampaignCharts(data.campaign_data);
        createChannelCharts(data.channel_data);
        
        // Update raw data table
        updateDataTable(data.raw_data);
    }
    
    // Update summary metrics
    function updateSummaryMetrics(summary) {
        document.getElementById('total-spend').textContent = '$' + summary.total_cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('total-clicks').textContent = summary.total_clicks.toLocaleString('en-US');
        document.getElementById('total-impressions').textContent = summary.total_impressions.toLocaleString('en-US');
        document.getElementById('total-conversions').textContent = summary.total_conversions.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    
    // Create 3D Summary Chart
    function createSummary3DChart(data) {
        const campaignData = data.campaign_data;
        
        // Prepare data for 3D chart
        const chartData = campaignData.map(campaign => ({
            name: campaign.campaign_name,
            value: campaign.cost,
            impressions: campaign.impressions,
            clicks: campaign.clicks,
            conversions: campaign.conversions || 0
        }));
        
        // Initialize ECharts instance
        if (!charts.summary3D) {
            charts.summary3D = echarts.init(document.getElementById('summary-3d-chart'));
        }
        
        // Set chart options
        const option = {
            tooltip: {
                formatter: function(params) {
                    return `<strong>${params.data.name}</strong><br/>
                            Cost: $${params.data.value.toFixed(2)}<br/>
                            Impressions: ${params.data.impressions.toLocaleString()}<br/>
                            Clicks: ${params.data.clicks.toLocaleString()}<br/>
                            Conversions: ${params.data.conversions.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;
                }
            },
            visualMap: {
                show: false,
                min: 0,
                max: Math.max(...chartData.map(item => item.value)),
                inRange: {
                    color: ['#4285f4', '#34a853', '#fbbc05', '#ea4335']
                }
            },
            xAxis3D: {
                type: 'value',
                name: 'Clicks',
                nameTextStyle: {
                    color: '#5f6368'
                },
                axisLine: {
                    lineStyle: {
                        color: '#dadce0'
                    }
                }
            },
            yAxis3D: {
                type: 'value',
                name: 'Conversions',
                nameTextStyle: {
                    color: '#5f6368'
                },
                axisLine: {
                    lineStyle: {
                        color: '#dadce0'
                    }
                }
            },
            zAxis3D: {
                type: 'value',
                name: 'Impressions',
                nameTextStyle: {
                    color: '#5f6368'
                },
                axisLine: {
                    lineStyle: {
                        color: '#dadce0'
                    }
                }
            },
            grid3D: {
                viewControl: {
                    autoRotate: true,
                    autoRotateSpeed: 10,
                    distance: 200
                },
                light: {
                    main: {
                        intensity: 1.2,
                        shadow: true
                    },
                    ambient: {
                        intensity: 0.3
                    }
                }
            },
            series: [{
                type: 'scatter3D',
                name: 'Campaigns',
                data: chartData.map(item => ({
                    name: item.name,
                    value: [item.clicks, item.conversions, item.impressions],
                    impressions: item.impressions,
                    clicks: item.clicks,
                    conversions: item.conversions,
                    symbolSize: Math.sqrt(item.value) / 5 + 10,
                    itemStyle: {
                        opacity: 0.8
                    }
                })),
                emphasis: {
                    itemStyle: {
                        color: '#ea4335',
                        opacity: 1
                    }
                },
                animation: true
            }]
        };
        
        // Set chart options
        charts.summary3D.setOption(option);
        
        // Handle window resize
        window.addEventListener('resize', function() {
            charts.summary3D.resize();
        });
    }

    // Create Daily Charts
    function createDailyCharts(dailyData) {
        // 1. Daily Cost Chart (3D Area)
        if (!charts.dailyCost) {
            charts.dailyCost = echarts.init(document.getElementById('daily-cost-chart'));
        }
        
        const dailyCostOption = {
            title: {
                text: 'Daily Cost Trend',
                left: 'center',
                textStyle: {
                    color: '#202124',
                    fontSize: 16
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    return `<strong>${params[0].name}</strong><br/>
                            Cost: $${params[0].value.toFixed(2)}`;
                }
            },
            xAxis: {
                type: 'category',
                data: dailyData.map(item => item.date),
                axisLabel: {
                    rotate: 45,
                    color: '#5f6368'
                },
                axisLine: {
                    lineStyle: {
                        color: '#dadce0'
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: 'Cost ($)',
                nameTextStyle: {
                    color: '#5f6368'
                },
                axisLine: {
                    lineStyle: {
                        color: '#dadce0'
                    }
                }
            },
            grid: {
                left: '5%',
                right: '5%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            series: [{
                data: dailyData.map(item => item.cost),
                type: 'line',
                smooth: true,
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(66, 133, 244, 0.8)' },
                        { offset: 1, color: 'rgba(66, 133, 244, 0.1)' }
                    ])
                },
                itemStyle: {
                    color: '#4285f4'
                },
                emphasis: {
                    itemStyle: {
                        color: '#ea4335'
                    }
                }
            }]
        };
        
        charts.dailyCost.setOption(dailyCostOption);
        
        // 2. Daily Clicks & Impressions Chart (3D Bar)
        if (!charts.dailyClicksImpressions) {
            charts.dailyClicksImpressions = echarts.init(document.getElementById('daily-clicks-impressions-chart'));
        }
        
        const dailyClicksImpressionsOption = {
            title: {
                text: 'Daily Clicks & Impressions',
                left: 'center',
                textStyle: {
                    color: '#202124',
                    fontSize: 16
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function(params) {
                    return `<strong>${params[0].name}</strong><br/>
                            Clicks: ${params[0].value.toLocaleString()}<br/>
                            Impressions: ${params[1].value.toLocaleString()}`;
                }
            },
            legend: {
                data: ['Clicks', 'Impressions'],
                bottom: 0,
                textStyle: {
                    color: '#5f6368'
                }
            },
            xAxis: {
                type: 'category',
                data: dailyData.map(item => item.date),
                axisLabel: {
                    rotate: 45,
                    color: '#5f6368'
                },
                axisLine: {
                    lineStyle: {
                        color: '#dadce0'
                    }
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'Clicks',
                    nameTextStyle: {
                        color: '#5f6368'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#dadce0'
                        }
                    },
                    axisLabel: {
                        color: '#5f6368'
                    }
                },
                {
                    type: 'value',
                    name: 'Impressions',
                    nameTextStyle: {
                        color: '#5f6368'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#dadce0'
                        }
                    },
                    axisLabel: {
                        color: '#5f6368'
                    }
                }
            ],
            grid: {
                left: '5%',
                right: '5%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            series: [
                {
                    name: 'Clicks',
                    type: 'bar',
                    data: dailyData.map(item => item.clicks),
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#4285f4' },
                            { offset: 1, color: '#34a853' }
                        ])
                    },
                    emphasis: {
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#ea4335' },
                                { offset: 1, color: '#fbbc05' }
                            ])
                        }
                    }
                },
                {
                    name: 'Impressions',
                    type: 'line',
                    yAxisIndex: 1,
                    data: dailyData.map(item => item.impressions),
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    lineStyle: {
                        width: 3,
                        color: '#fbbc05'
                    },
                    itemStyle: {
                        color: '#fbbc05'
                    }
                }
            ]
        };
        
        charts.dailyClicksImpressions.setOption(dailyClicksImpressionsOption);
        
        // 3. Daily Conversions Chart (3D Line)
        if (!charts.dailyConversions) {
            charts.dailyConversions = echarts.init(document.getElementById('daily-conversions-chart'));
        }
        
        const dailyConversionsOption = {
            title: {
                text: 'Daily Conversions',
                left: 'center',
                textStyle: {
                    color: '#202124',
                    fontSize: 16
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    return `<strong>${params[0].name}</strong><br/>
                            Conversions: ${params[0].value.toFixed(2)}<br/>
                            Conversion Value: $${params[1].value.toFixed(2)}`;
                }
            },
            legend: {
                data: ['Conversions', 'Conversion Value'],
                bottom: 0,
                textStyle: {
                    color: '#5f6368'
                }
            },
            xAxis: {
                type: 'category',
                data: dailyData.map(item => item.date),
                axisLabel: {
                    rotate: 45,
                    color: '#5f6368'
                },
                axisLine: {
                    lineStyle: {
                        color: '#dadce0'
                    }
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'Conversions',
                    nameTextStyle: {
                        color: '#5f6368'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#dadce0'
                        }
                    },
                    axisLabel: {
                        color: '#5f6368'
                    }
                },
                {
                    type: 'value',
                    name: 'Conversion Value ($)',
                    nameTextStyle: {
                        color: '#5f6368'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#dadce0'
                        }
                    },
                    axisLabel: {
                        color: '#5f6368'
                    }
                }
            ],
            grid: {
                left: '5%',
                right: '5%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            series: [
                {
                    name: 'Conversions',
                    type: 'line',
                    data: dailyData.map(item => item.conversions || 0),
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    lineStyle: {
                        width: 3,
                        color: '#34a853'
                    },
                    itemStyle: {
                        color: '#34a853'
                    }
                },
                {
                    name: 'Conversion Value',
                    type: 'line',
                    yAxisIndex: 1,
                    data: dailyData.map(item => item.conversion_value || 0),
                    smooth: true,
                    symbol: 'triangle',
                    symbolSize: 8,
                    lineStyle: {
                        width: 3,
                        color: '#ea4335'
                    },
                    itemStyle: {
                        color: '#ea4335'
                    }
                }
            ]
        };
        
        charts.dailyConversions.setOption(dailyConversionsOption);
        
        // 4. Performance Bubble Chart (3D Bubble)
        if (!charts.performanceBubble) {
            charts.performanceBubble = echarts.init(document.getElementById('performance-bubble-chart'));
        }
        
        const bubbleData = dailyData.map(item => ({
            date: item.date,
            clicks: item.clicks,
            impressions: item.impressions,
            cost: item.cost,
            conversions: item.conversions || 0
        }));
        
        const performanceBubbleOption = {
            title: {
                text: '3D Performance Bubble Chart',
                left: 'center',
                textStyle: {
                    color: '#202124',
                    fontSize: 16
                }
            },
            tooltip: {
                formatter: function(params) {
                    return `<strong>${params.data.date}</strong><br/>
                            Clicks: ${params.data.clicks.toLocaleString()}<br/>
                            Impressions: ${params.data.impressions.toLocaleString()}<br/>
                            Cost: $${params.data.cost.toFixed(2)}<br/>
                            Conversions: ${params.data.conversions.toFixed(2)}`;
                }
            },
            grid3D: {
                viewControl: {
                    autoRotate: true,
                    autoRotateSpeed: 5,
                    distance: 200
                },
                light: {
                    main: {
                        intensity: 1.2,
                        shadow: true
                    },
                    ambient: {
                        intensity: 0.3
                    }
                }
            },
            xAxis3D: {
                type: 'value',
                name: 'Clicks',
                nameTextStyle: {
                    color: '#5f6368'
                },
                axisLine: {
                    lineStyle: {
                        color: '#dadce0'
                    }
                }
            },
            yAxis3D: {
                type: 'value',
                name: 'Cost ($)',
                nameTextStyle: {
                    color: '#5f6368'
                },
                axisLine: {
                    lineStyle: {
                        color: '#dadce0'
                    }
                }
            },
            zAxis3D: {
                type: 'value',
                name: 'Impressions',
                nameTextStyle: {
                    color: '#5f6368'
                },
                axisLine: {
                    lineStyle: {
                        color: '#dadce0'
                    }
                }
            },
            visualMap: {
                dimension: 2,
                min: 0,
                max: Math.max(...bubbleData.map(item => item.impressions)),
                inRange: {
                    color: ['#4285f4', '#34a853', '#fbbc05', '#ea4335']
                },
                textStyle: {
                    color: '#5f6368'
                }
            },
            series: [{
                type: 'scatter3D',
                data: bubbleData.map(item => ({
                    value: [item.clicks, item.cost, item.impressions],
                    date: item.date,
                    clicks: item.clicks,
                    impressions: item.impressions,
                    cost: item.cost,
                    conversions: item.conversions,
                    symbolSize: Math.sqrt(item.conversions) * 5 + 5
                })),
                emphasis: {
                    itemStyle: {
                        color: '#ea4335',
                        opacity: 1
                    }
                }
            }]
        };
        
        charts.performanceBubble.setOption(performanceBubbleOption);
        
        // Resize charts on window resize
        window.addEventListener('resize', function() {
            charts.dailyCost.resize();
            charts.dailyClicksImpressions.resize();
            charts.dailyConversions.resize();
            charts.performanceBubble.resize();
        });
    }

    // Create Campaign Charts
    function createCampaignCharts(campaignData) {
        // Check if data is available
        if (!campaignData || campaignData.length === 0) {
            console.warn('No campaign data available');
            return;
        }

        // 1. Campaign Cost Bar Chart
        const campaignCostChart = document.getElementById('campaign-cost-chart');
        if (campaignCostChart) {
            if (!charts.campaignCost) {
                charts.campaignCost = echarts.init(campaignCostChart);
            }
            
            const campaignCostOption = {
                title: {
                    text: 'Campaign Cost Distribution',
                    left: 'center',
                    textStyle: {
                        color: '#202124',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: '{b}: ${c}'
                },
                grid: {
                    left: '5%',
                    right: '5%',
                    bottom: '10%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: campaignData.map(campaign => campaign.campaign_name),
                    axisLabel: {
                        rotate: 45,
                        textStyle: {
                            color: '#5f6368'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'Cost ($)',
                    nameTextStyle: {
                        color: '#5f6368'
                    },
                    axisLabel: {
                        formatter: '${value}',
                        textStyle: {
                            color: '#5f6368'
                        }
                    }
                },
                series: [{
                    name: 'Cost',
                    type: 'bar',
                    data: campaignData.map(campaign => campaign.cost),
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {offset: 0, color: '#4285f4'},
                            {offset: 1, color: '#34a853'}
                        ])
                    },
                    emphasis: {
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {offset: 0, color: '#ea4335'},
                                {offset: 1, color: '#fbbc05'}
                            ])
                        }
                    }
                }]
            };
            
            charts.campaignCost.setOption(campaignCostOption);
        }
        
        // 2. Campaign Pie Chart
        const campaignPieChart = document.getElementById('campaign-pie-chart');
        if (campaignPieChart) {
            if (!charts.campaignPie) {
                charts.campaignPie = echarts.init(campaignPieChart);
            }
            
            const campaignPieOption = {
                title: {
                    text: 'Campaign Clicks Distribution',
                    left: 'center',
                    textStyle: {
                        color: '#202124',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    textStyle: {
                        color: '#5f6368'
                    }
                },
                series: [{
                    name: 'Clicks',
                    type: 'pie',
                    radius: '65%',
                    center: ['50%', '50%'],
                    data: campaignData.map(campaign => ({
                        value: campaign.clicks,
                        name: campaign.campaign_name
                    })),
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    }
                }]
            };
            
            charts.campaignPie.setOption(campaignPieOption);
        }

        // 3. Campaign Tree Chart
        const campaignTreeChart = document.getElementById('campaign-tree-chart');
        if (campaignTreeChart) {
            if (!charts.campaignTree) {
                charts.campaignTree = echarts.init(campaignTreeChart);
            }
            
            const campaignTreeOption = {
                title: {
                    text: 'Campaign Efficiency',
                    left: 'center',
                    textStyle: {
                        color: '#202124',
                        fontSize: 16
                    }
                },
                tooltip: {
                    formatter: function(info) {
                        const campaign = campaignData.find(c => c.campaign_name === info.name);
                        if (campaign) {
                            return `<strong>${info.name}</strong><br/>
                                    Cost: $${campaign.cost.toFixed(2)}<br/>
                                    Clicks: ${campaign.clicks}<br/>
                                    Conversions: ${campaign.conversions.toFixed(2)}`;
                        }
                        return info.name;
                    }
                },
                series: [{
                    type: 'treemap',
                    data: campaignData.map(campaign => ({
                        name: campaign.campaign_name,
                        value: campaign.cost,
                        itemStyle: {
                            color: campaign.conversions > 10 ? '#34a853' : 
                                   campaign.conversions > 5 ? '#fbbc05' : '#ea4335'
                        }
                    })),
                    label: {
                        show: true,
                        formatter: '{b}',
                        color: '#fff'
                    },
                    breadcrumb: {
                        show: false
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            };
            
            charts.campaignTree.setOption(campaignTreeOption);
        }

        // 4. Campaign Waterfall Chart
        const campaignWaterfallChart = document.getElementById('campaign-waterfall-chart');
        if (campaignWaterfallChart) {
            if (!charts.campaignWaterfall) {
                charts.campaignWaterfall = echarts.init(campaignWaterfallChart);
            }
            
            // Sort campaigns by cost for waterfall chart
            const sortedCampaigns = [...campaignData].sort((a, b) => b.cost - a.cost).slice(0, 5);
            
            const campaignWaterfallOption = {
                title: {
                    text: 'Top 5 Campaign Performance',
                    left: 'center',
                    textStyle: {
                        color: '#202124',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: function(params) {
                        const campaign = sortedCampaigns.find(c => c.campaign_name === params[0].name);
                        if (campaign) {
                            return `<strong>${params[0].name}</strong><br/>
                                    Cost: $${campaign.cost.toFixed(2)}<br/>
                                    Clicks: ${campaign.clicks}<br/>
                                    Conversions: ${campaign.conversions.toFixed(2)}`;
                        }
                        return params[0].name;
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: sortedCampaigns.map(campaign => campaign.campaign_name),
                    axisLabel: {
                        rotate: 45,
                        interval: 0,
                        textStyle: {
                            color: '#5f6368'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'Cost ($)',
                    nameTextStyle: {
                        color: '#5f6368'
                    },
                    axisLabel: {
                        formatter: '${value}',
                        textStyle: {
                            color: '#5f6368'
                        }
                    }
                },
                series: [{
                    name: 'Cost',
                    type: 'bar',
                    stack: 'Total',
                    label: {
                        show: true,
                        formatter: '${c}',
                        position: 'top'
                    },
                    data: sortedCampaigns.map(campaign => campaign.cost),
                    itemStyle: {
                        color: function(params) {
                            const colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335', '#5f6368'];
                            return colors[params.dataIndex % colors.length];
                        }
                    }
                }]
            };
            
            charts.campaignWaterfall.setOption(campaignWaterfallOption);
        }

        // 5. Campaign Donut Chart
        const campaignDonutChart = document.getElementById('campaign-donut-chart');
        if (campaignDonutChart) {
            if (!charts.campaignDonut) {
                charts.campaignDonut = echarts.init(campaignDonutChart);
            }
            
            const campaignDonutOption = {
                title: {
                    text: 'Campaign Conversion Distribution',
                    left: 'center',
                    textStyle: {
                        color: '#202124',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    textStyle: {
                        color: '#5f6368'
                    }
                },
                series: [{
                    name: 'Conversions',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '16',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: campaignData.map(campaign => ({
                        value: campaign.conversions,
                        name: campaign.campaign_name
                    }))
                }]
            };
            
            charts.campaignDonut.setOption(campaignDonutOption);
        }

        // 6. Campaign Scatter Chart
        const campaignScatterChart = document.getElementById('campaign-scatter-chart');
        if (campaignScatterChart) {
            if (!charts.campaignScatter) {
                charts.campaignScatter = echarts.init(campaignScatterChart);
            }
            
            const campaignScatterOption = {
                title: {
                    text: 'Cost vs. Conversions',
                    left: 'center',
                    textStyle: {
                        color: '#202124',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: function(params) {
                        return `<strong>${params.data.name}</strong><br/>
                                Cost: $${params.data.x.toFixed(2)}<br/>
                                Conversions: ${params.data.y.toFixed(2)}`;
                    }
                },
                xAxis: {
                    type: 'value',
                    name: 'Cost ($)',
                    nameTextStyle: {
                        color: '#5f6368'
                    },
                    axisLabel: {
                        formatter: '${value}',
                        textStyle: {
                            color: '#5f6368'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'Conversions',
                    nameTextStyle: {
                        color: '#5f6368'
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#5f6368'
                        }
                    }
                },
                series: [{
                    type: 'scatter',
                    symbolSize: function(data) {
                        return Math.sqrt(data[2]) * 5;
                    },
                    data: campaignData.map(campaign => ({
                        name: campaign.campaign_name,
                        value: [campaign.cost, campaign.conversions, campaign.clicks],
                        x: campaign.cost,
                        y: campaign.conversions
                    })),
                    itemStyle: {
                        color: function(params) {
                            const campaign = campaignData[params.dataIndex];
                            return campaign.roi > 100 ? '#34a853' : 
                                   campaign.roi > 0 ? '#fbbc05' : '#ea4335';
                        }
                    }
                }]
            };
            
            charts.campaignScatter.setOption(campaignScatterOption);
        }

        // Resize charts on window resize
        window.addEventListener('resize', function() {
            for (let chart in charts) {
                if (charts[chart]) {
                    charts[chart].resize();
                }
            }
        });
    }
    
    // Create Channel Charts
    function createChannelCharts(channelData) {
        // Check if data is available
        if (!channelData || channelData.length === 0) {
            console.warn('No channel data available');
            return;
        }

        // 1. Channel Distribution Chart
        const channelDistChart = document.getElementById('channel-distribution-chart');
        if (channelDistChart) {
            if (!charts.channelDist) {
                charts.channelDist = echarts.init(channelDistChart);
            }
            
            const channelDistOption = {
                title: {
                    text: 'Channel Cost Distribution',
                    left: 'center',
                    textStyle: {
                        color: '#202124',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: ${c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    textStyle: {
                        color: '#5f6368'
                    }
                },
                series: [{
                    name: 'Channel Cost',
                    type: 'pie',
                    radius: '65%',
                    center: ['50%', '50%'],
                    data: channelData.map(channel => ({
                        value: channel.cost,
                        name: channel.channel_name
                    })),
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            };
            
            charts.channelDist.setOption(channelDistOption);
        }
        
        // 2. Channel Performance Chart
        const channelPerfChart = document.getElementById('channel-performance-chart');
        if (channelPerfChart) {
            if (!charts.channelPerf) {
                charts.channelPerf = echarts.init(channelPerfChart);
            }
            
            const channelPerfOption = {
                title: {
                    text: 'Channel Performance Comparison',
                    left: 'center',
                    textStyle: {
                        color: '#202124',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['Clicks', 'Impressions', 'Conversions'],
                    bottom: 0,
                    textStyle: {
                        color: '#5f6368'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: channelData.map(channel => channel.channel_name),
                    axisLabel: {
                        textStyle: {
                            color: '#5f6368'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'Count',
                    nameTextStyle: {
                        color: '#5f6368'
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#5f6368'
                        }
                    }
                },
                series: [
                    {
                        name: 'Clicks',
                        type: 'bar',
                        data: channelData.map(channel => channel.clicks),
                        itemStyle: {
                            color: '#4285f4'
                        }
                    },
                    {
                        name: 'Impressions',
                        type: 'bar',
                        data: channelData.map(channel => channel.impressions / 100), // Scaled for visibility
                        itemStyle: {
                            color: '#34a853'
                        }
                    },
                    {
                        name: 'Conversions',
                        type: 'bar',
                        data: channelData.map(channel => channel.conversions),
                        itemStyle: {
                            color: '#ea4335'
                        }
                    }
                ]
            };
            
            charts.channelPerf.setOption(channelPerfOption);
        }
        
        // 3. Channel ROI Chart
        const channelRoiChart = document.getElementById('channel-roi-chart');
        if (channelRoiChart) {
            if (!charts.channelRoi) {
                charts.channelRoi = echarts.init(channelRoiChart);
            }
            
            // Calculate ROI for each channel
            const channelRoiData = channelData.map(channel => ({
                channel_name: channel.channel_name,
                roi: (channel.conversion_value - channel.cost) / channel.cost * 100
            }));
            
            const channelRoiOption = {
                title: {
                    text: 'Channel ROI Comparison',
                    left: 'center',
                    textStyle: {
                        color: '#202124',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}: {c}%'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '10%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: channelRoiData.map(item => item.channel_name),
                    axisLabel: {
                        textStyle: {
                            color: '#5f6368'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'ROI (%)',
                    nameTextStyle: {
                        color: '#5f6368'
                    },
                    axisLabel: {
                        formatter: '{value}%',
                        textStyle: {
                            color: '#5f6368'
                        }
                    }
                },
                series: [{
                    type: 'bar',
                    data: channelRoiData.map(item => item.roi.toFixed(2)),
                    itemStyle: {
                        color: function(params) {
                            const value = channelRoiData[params.dataIndex].roi;
                            return value > 100 ? '#34a853' : 
                                   value > 0 ? '#fbbc05' : '#ea4335';
                        }
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '{c}%'
                    }
                }]
            };
            
            charts.channelRoi.setOption(channelRoiOption);
        }
        
        // 4. Channel Bubble Chart
        const channelBubbleChart = document.getElementById('channel-bubble-chart');
        if (channelBubbleChart) {
            if (!charts.channelBubble) {
                charts.channelBubble = echarts.init(channelBubbleChart);
            }
            
            const channelBubbleOption = {
                title: {
                    text: 'Channel Performance Bubble Chart',
                    left: 'center',
                    textStyle: {
                        color: '#202124',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: function(params) {
                        return `<strong>${params.data.name}</strong><br/>
                                Cost: $${params.data.value[0].toFixed(2)}<br/>
                                Conversions: ${params.data.value[1].toFixed(2)}<br/>
                                Clicks: ${params.data.value[2]}`;
                    }
                },
                grid: {
                    left: '5%',
                    right: '5%',
                    top: '15%',
                    bottom: '10%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    name: 'Cost ($)',
                    nameTextStyle: {
                        color: '#5f6368'
                    },
                    axisLabel: {
                        formatter: '${value}',
                        textStyle: {
                            color: '#5f6368'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'Conversions',
                    nameTextStyle: {
                        color: '#5f6368'
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#5f6368'
                        }
                    }
                },
                series: [{
                    type: 'scatter',
                    symbolSize: function(data) {
                        return Math.sqrt(data[2]) * 5;
                    },
                    data: channelData.map(channel => ({
                        name: channel.channel_name,
                        value: [channel.cost, channel.conversions, channel.clicks]
                    })),
                    itemStyle: {
                        color: function(params) {
                            const colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335', '#5f6368'];
                            return colors[params.dataIndex % colors.length];
                        }
                    }
                }]
            };
            
            charts.channelBubble.setOption(channelBubbleOption);
        }
    }
    
    // Update data table
    function updateDataTable(rawData) {
        if (!rawData || rawData.length === 0) {
            console.warn('No raw data available for table');
            return;
        }
        
        const tableContainer = document.getElementById('data-table-container');
        if (!tableContainer) {
            console.error('Data table container not found');
            return;
        }
        
        // Clear existing table
        tableContainer.innerHTML = '';
        
        // Create table element
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Get all unique keys from the data
        const allKeys = [];
        rawData.forEach(item => {
            Object.keys(item).forEach(key => {
                if (!allKeys.includes(key)) {
                    allKeys.push(key);
                }
            });
        });
        
        // Format column headers
        const displayHeaders = {
            'campaign_id': 'Campaign ID',
            'campaign_name': 'Campaign Name',
            'status': 'Status',
            'channel_type': 'Channel Type',
            'date': 'Date',
            'impressions': 'Impressions',
            'clicks': 'Clicks',
            'ctr': 'CTR (%)',
            'avg_cpc': 'Avg. CPC ($)',
            'conversions': 'Conversions',
            'conversion_value': 'Conv. Value ($)',
            'cost': 'Cost ($)',
            'conversion_rate': 'Conv. Rate (%)',
            'interaction_rate': 'Interaction Rate (%)',
            'video_views': 'Video Views',
            'view_through_conversions': 'View-Through Conv.'
        };
        
        // Create header cells
        allKeys.forEach(key => {
            const th = document.createElement('th');
            th.textContent = displayHeaders[key] || key;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Add data rows
        rawData.forEach(item => {
            const row = document.createElement('tr');
            
            allKeys.forEach(key => {
                const td = document.createElement('td');
                let value = item[key];
                
                // Format values based on column type
                if (key === 'cost' || key === 'avg_cpc' || key === 'conversion_value') {
                    value = value !== undefined ? `$${parseFloat(value).toFixed(2)}` : '-';
                } else if (key === 'ctr' || key === 'conversion_rate' || key === 'interaction_rate') {
                    value = value !== undefined ? `${parseFloat(value).toFixed(2)}%` : '-';
                } else if (key === 'impressions' || key === 'clicks' || key === 'video_views') {
                    value = value !== undefined ? parseInt(value).toLocaleString() : '-';
                } else if (key === 'conversions' || key === 'view_through_conversions') {
                    value = value !== undefined ? parseFloat(value).toFixed(2) : '-';
                }
                
                td.textContent = value !== undefined ? value : '-';
                row.appendChild(td);
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
    }
});
