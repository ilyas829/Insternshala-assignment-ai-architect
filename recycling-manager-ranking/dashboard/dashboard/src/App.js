import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  Group, 
  Badge, 
  Card, 
  Progress, 
  Table,
  Avatar,
  Grid,
  Stack,
  Button,
  Select,
  Tabs,
  Divider
} from '@mantine/core';
import { 
  IconTrophy, 
  IconChartBar, 
  IconUsers, 
  IconList, 
  IconBriefcase,
  IconSchool,
  IconMapPin,
  IconMail,
  IconStar,
  IconRefresh,
  IconRecycle
} from '@tabler/icons-react';
import './App.css';

// Sample data (use your actual data)
const sampleCandidates = [
  {
    id: 1,
    name: "Alex Chen",
    experience: 8,
    skills: "Lean Manufacturing, Six Sigma, ERP Systems",
    email: "alex.chen@example.com",
    location: "Chicago, IL",
    education: "Master's Degree",
    crisis_management_score: 8.7,
    sustainability_score: 9.2,
    team_motivation_score: 7.9,
    total_score: 8.6,
    rank_position: 4,
    evaluated_at: "2024-01-15T10:30:00Z",
    achievements: [
      "Reduced waste by 35% in previous role",
      "Improved team productivity by 28%",
      "Implemented cost-saving measures saving $120,000 annually"
    ]
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    experience: 12,
    skills: "Team Leadership, Process Optimization, ISO 14001",
    email: "maria.rodriguez@example.com",
    location: "Houston, TX",
    education: "Bachelor's Degree",
    crisis_management_score: 9.5,
    sustainability_score: 8.3,
    team_motivation_score: 8.8,
    total_score: 8.9,
    rank_position: 1,
    evaluated_at: "2024-01-15T10:30:00Z",
    achievements: [
      "Led plant expansion increasing capacity by 40%",
      "Achieved 99% safety compliance for 3 consecutive years",
      "Reduced energy consumption by 25%"
    ]
  },
  // Add more candidates as needed
];

function App() {
  const [candidates, setCandidates] = useState(sampleCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState(sampleCandidates[0]);
  const [activeTab, setActiveTab] = useState('leaderboard');

  const Leaderboard = () => (
    <Paper p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>🏆 Leaderboard</Title>
        <Badge color="teal">Top 10 Candidates</Badge>
      </Group>
      
      <Table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Candidate</th>
            <th>Score</th>
            <th>Experience</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(candidate => (
            <tr 
              key={candidate.id} 
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedCandidate(candidate)}
            >
              <td>
                <Badge color={candidate.rank_position === 1 ? 'yellow' : 'gray'}>
                  #{candidate.rank_position}
                </Badge>
              </td>
              <td>
                <Group>
                  <Avatar size="sm">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Text fw={500}>{candidate.name}</Text>
                </Group>
              </td>
              <td>
                <Badge color="teal" size="lg">
                  {candidate.total_score.toFixed(1)}
                </Badge>
              </td>
              <td>{candidate.experience} years</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Paper>
  );

  const SkillHeatmap = () => (
    <Paper p="lg" radius="md" withBorder>
      <Title order={3} mb="md">📊 Skill Analysis</Title>
      
      <Grid>
        <Grid.Col span={6}>
          <Card withBorder p="md">
            <Text fw={500} mb="sm">Crisis Management</Text>
            <Progress 
              value={candidates.reduce((sum, c) => sum + c.crisis_management_score, 0) / candidates.length * 10} 
              color="orange" 
              size="lg"
            />
          </Card>
        </Grid.Col>
        
        <Grid.Col span={6}>
          <Card withBorder p="md">
            <Text fw={500} mb="sm">Sustainability</Text>
            <Progress 
              value={candidates.reduce((sum, c) => sum + c.sustainability_score, 0) / candidates.length * 10} 
              color="green" 
              size="lg"
            />
          </Card>
        </Grid.Col>
        
        <Grid.Col span={6}>
          <Card withBorder p="md">
            <Text fw={500} mb="sm">Team Motivation</Text>
            <Progress 
              value={candidates.reduce((sum, c) => sum + c.team_motivation_score, 0) / candidates.length * 10} 
              color="blue" 
              size="lg"
            />
          </Card>
        </Grid.Col>
        
        <Grid.Col span={6}>
          <Card withBorder p="md">
            <Text fw={500} mb="sm">Total Score</Text>
            <Progress 
              value={candidates.reduce((sum, c) => sum + c.total_score, 0) / candidates.length * 10} 
              color="teal" 
              size="lg"
            />
          </Card>
        </Grid.Col>
      </Grid>
    </Paper>
  );

  const CandidateCard = ({ candidate }) => (
    <Paper p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Group>
          <Avatar size="xl" color="teal">
            {candidate.name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <div>
            <Title order={3}>{candidate.name}</Title>
            <Text c="dimmed">Rank #{candidate.rank_position}</Text>
          </div>
        </Group>
        <Badge color="teal" size="xl">
          {candidate.total_score.toFixed(1)}/10
        </Badge>
      </Group>

      <Divider my="md" />

      <Grid>
        <Grid.Col span={6}>
          <Group mb="sm">
            <IconBriefcase size={16} />
            <Text fw={500}>Experience:</Text>
            <Text>{candidate.experience} years</Text>
          </Group>
          
          <Group mb="sm">
            <IconSchool size={16} />
            <Text fw={500}>Education:</Text>
            <Text>{candidate.education}</Text>
          </Group>
        </Grid.Col>
        
        <Grid.Col span={6}>
          <Group mb="sm">
            <IconMapPin size={16} />
            <Text fw={500}>Location:</Text>
            <Text>{candidate.location}</Text>
          </Group>
          
          <Group mb="sm">
            <IconMail size={16} />
            <Text fw={500}>Email:</Text>
            <Text>{candidate.email}</Text>
          </Group>
        </Grid.Col>
      </Grid>

      <Divider my="md" />

      <Title order={4} mb="sm">Skills</Title>
      <Group mb="md">
        {candidate.skills.split(', ').map((skill, index) => (
          <Badge key={index} color={index % 2 === 0 ? 'blue' : 'teal'}>
            {skill}
          </Badge>
        ))}
      </Group>

      <Title order={4} mb="sm">Skill Scores</Title>
      <Stack gap="sm">
        <div>
          <Group justify="space-between">
            <Text>Crisis Management</Text>
            <Badge color="orange">{candidate.crisis_management_score.toFixed(1)}</Badge>
          </Group>
          <Progress value={candidate.crisis_management_score * 10} color="orange" />
        </div>
        
        <div>
          <Group justify="space-between">
            <Text>Sustainability</Text>
            <Badge color="green">{candidate.sustainability_score.toFixed(1)}</Badge>
          </Group>
          <Progress value={candidate.sustainability_score * 10} color="green" />
        </div>
        
        <div>
          <Group justify="space-between">
            <Text>Team Motivation</Text>
            <Badge color="blue">{candidate.team_motivation_score.toFixed(1)}</Badge>
          </Group>
          <Progress value={candidate.team_motivation_score * 10} color="blue" />
        </div>
      </Stack>
    </Paper>
  );

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Paper p="lg" radius="md" withBorder mb="xl" bg="#f0f9ff">
        <Group justify="space-between">
          <Group>
            <IconRecycle size={40} color="#0d9488" />
            <div>
              <Title order={1}>♻️ Recycling Manager Ranking</Title>
              <Text c="dimmed">AI-powered candidate evaluation system</Text>
            </div>
          </Group>
          <Button leftSection={<IconRefresh size={18} />} variant="light">
            Refresh
          </Button>
        </Group>
      </Paper>

      <Grid>
        <Grid.Col span={8}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List mb="md">
              <Tabs.Tab value="leaderboard" leftSection={<IconList size={16} />}>
                Leaderboard
              </Tabs.Tab>
              <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />}>
                Analytics
              </Tabs.Tab>
              <Tabs.Tab value="candidates" leftSection={<IconUsers size={16} />}>
                Candidates
              </Tabs.Tab>
            </Tabs.List>

            {activeTab === 'leaderboard' && <Leaderboard />}
            {activeTab === 'analytics' && <SkillHeatmap />}
            {activeTab === 'candidates' && (
              <Grid>
                {candidates.map(candidate => (
                  <Grid.Col key={candidate.id} span={6}>
                    <CandidateCard candidate={candidate} />
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Tabs>
        </Grid.Col>

        <Grid.Col span={4}>
          <Stack>
            <Paper p="lg" radius="md" withBorder>
              <Title order={3} mb="md">👑 Top Performer</Title>
              <CandidateCard candidate={candidates[0]} />
            </Paper>

            <Paper p="lg" radius="md" withBorder>
              <Title order={3} mb="md">📊 Stats</Title>
              <Grid>
                <Grid.Col span={6}>
                  <Card withBorder>
                    <Text size="sm" c="dimmed">Total Candidates</Text>
                    <Title order={2}>{candidates.length}</Title>
                  </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Card withBorder>
                    <Text size="sm" c="dimmed">Avg Score</Text>
                    <Title order={2}>
                      {(candidates.reduce((sum, c) => sum + c.total_score, 0) / candidates.length).toFixed(1)}
                    </Title>
                  </Card>
                </Grid.Col>
              </Grid>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default App;