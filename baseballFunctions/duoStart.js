

module.exports = ({ client, user, target, message }) => {
  const { channel, content, author } = message;
  
  let post;
  if (content.toLowerCase().includes('--post')) post = true;
  
  let will = checkWill(channel, target, post);
  will = will[0];
  post = will[1];
  
  console.log(will, post);
}