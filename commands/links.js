module.exports = {
  name: 'links',
  category: 'general',
  hidden: true,
  description: 'Owner Only',
  run: async ({message}) => {
    if(message.author.id === '772368021821718549') {
      message.channel.send(`
      Github Repo: https://github.com/dash096/handcricket\n
      Heroku Logs: https://dashboard.heroku.com/apps/handcricket/logs\n
      Mongo Db: https://cloud.mongodb.com/v2/6050c5b487e707452e5775fc#metrics/replicaSet/6050c683609d0f72eb754ff4/explorer/myFirstDatabase/players/find
      `)
    }
  }
}