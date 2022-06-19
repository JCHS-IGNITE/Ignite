module.exports = (req, res) => {
  if (req.method === 'GET')
    res.render('staticPage', {
      title: '404',
      subTitle: '페이지를 찾을 수 없습니다.',
    });
  else res.json({ msg: 'Page not found.' });
};
