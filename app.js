const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Rota para cadastro
app.post('/api/cadastro', (req, res) => {
    const { nome, email, idade, numero, ip, grupo, motivo } = req.body;

    const registro = `Nome: ${nome}, Email: ${email}, Idade: ${idade}, Número: ${numero}, IP: ${ip}, Grupo: ${grupo}, Motivo: ${motivo}, Status: Aguarde, Data: ${new Date().toISOString()}\n`;

    fs.appendFile('dados.csv', registro, (err) => {
        if (err) {
            console.error('Erro ao gravar no arquivo:', err);
            return res.status(500).json({ message: 'Erro ao gravar dados' });
        }
        res.status(200).json({ message: 'Dados registrados com sucesso' });
    });
});

// Rota para obter dados do CSV
app.get('/api/dados', (req, res) => {
    fs.readFile('dados.csv', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao ler dados' });
        }

        const users = data.trim().split('\n').map(line => {
            const user = {};
            line.split(', ').forEach(pair => {
                const [key, value] = pair.split(': ');
                user[key.trim()] = value ? value.trim() : '';
            });
            return user;
        });

        res.json(users);
    });
});

// Rota para atualizar o status de um usuário
app.post('/api/update', (req, res) => {
    const { nome, status } = req.body;

    fs.readFile('dados.csv', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao ler dados' });
        }

        const updatedLines = data.trim().split('\n').map(line => {
            const user = {};
            line.split(', ').forEach(pair => {
                const [key, value] = pair.split(': ');
                user[key.trim()] = value ? value.trim() : '';
            });

            if (user.Nome === nome) {
                user.Status = status;
            }

            return `Nome: ${user.Nome}, Email: ${user.Email}, Idade: ${user.Idade}, Número: ${user.Número}, IP: ${user.IP}, Grupo: ${user.Grupo}, Motivo: ${user.Motivo}, Status: ${user.Status}, Data: ${user.Data}`;
        });

        fs.writeFile('dados.csv', updatedLines.join('\n') + '\n', err => {
            if (err) {
                return res.status(500).json({ message: 'Erro ao gravar dados' });
            }
            res.status(200).json({ message: 'Status atualizado com sucesso' });
        });
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});