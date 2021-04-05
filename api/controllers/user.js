const db = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const sequelize = require('../db/sequelize');
const User = require('../models/User');
const Post = require('../models/Post');
const News = require('../models/News');
const Comment = require('../models/Comments');
const Like = require('../models/Likes');
const Unlike = require('../models/Unlikes');
const Notification = require('../models/Notifications');
const Follow = require('../models/Follows');
const Unfollow = require('../models/Unfollows');
const VerificationToken = require('../models/VerificationToken');
const ResetPassword = require('../models/Reset');


const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const sendMail = require('../sendmail');

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Add post
//#1 - Upload image
exports.post_image = async (req, res) => {
    const { filename: image } = req.file;
    const avatar = req.file.filename;

    //Resize image
    // await sharp(req.file.path)
    //     .jpeg({ progressive: true, force: false })
    //     .png({ progressive: true, force: false })
    //     .toFile(
    //         path.resolve(req.file.destination, image)
    //     );
    // fs.unlinkSync(req.file.path);

    return res.json({
        success: true,
        message: avatar
    });
};

// #2 - Add post
exports.add_post = (req, res) => {
    var { image, body } = req.body;
    // Verify that the image is not null
    // if (body == undefined) {
    //     return res.json({
    //         success: false,
    //         message: 'Write something!'
    //     });
    // }

    if (body == '' && image == '') {
        return res.json({
            success: false,
            message: 'Error!'
        });
    }

    // Verify that the image is in tmp folder
    var oldPath = './public/images/posts/tmp/' + image;
    if (image != '' && !fs.existsSync(oldPath)) {
        return res.json({
            success: false,
            message: 'Please re-upload the image'
        });
    }

    // Move the image


    Post.create({
        image: image,
        body: body,
        user_id: req.userData.id,
    }).then(result => {
        if (result) {
            var newPath = './public/images/posts/' + result.id + '/';
            if (!fs.existsSync(newPath)) {
                fs.mkdirSync(newPath);
            }

            fs.rename(oldPath, newPath + image, function (err) {
                if (err) throw err
                console.log('Successfully renamed - AKA moved!')
            });

            return res.json({
                success: true,
                message: 'Post added'
            });
        } else {
            return res.json({
                success: false,
                message: 'Error adding post'
            });
        }
    }).catch(error => {
        console.log(error);
        return res.json({
            success: false,
            message: 'Error adding post'
        });
    });

};


// Get post by id
exports.get_post = (req, res) => {
    var id = req.params.id;
    if (id == undefined) {
        return res.json({
            success: false,
            message: 'Please insert post id!'
        });
    }

    db.query(
        "SELECT p.id, "
        + "         p.image, "
        + "         p.body, "
        + "         p.created_at AS date, "
        + "                (SELECT Json_object('id', u.id, 'username', u.username, 'first_name', u.first_name, 'last_name', "
        + "                        u.last_name, "
        + "                                'avatar', u.avatar) "
        + "                 FROM   users u "
        + "                 WHERE  p.user_id = u.id) AS user, "
        + "                (SELECT Count(l.user_id) "
        + "                 FROM   likes l "
        + "                 WHERE  l.post_id = p.id) AS likes, "
        + "                (SELECT Count(c.user_id) "
        + "                 FROM   comments c "
        + "                 WHERE  c.post_id = p.id) AS comments, "
        + "                (SELECT Count(l.user_id) "
        + "                 FROM   likes l "
        + "                 WHERE  l.post_id = p.id AND l.user_id = ? ) AS liked "
        + "         FROM   posts p "
        + "         WHERE  p.id = ? "
        + "         ORDER BY "
        + "             p.created_at DESC", [req.userData.id, id], (error, result, fields) => {
            if (!error) {
                // for (var i = 0; i < result.length; i++) {
                //     result[i].user = JSON.parse(result[i].user);
                // }
                return res.json({
                    success: true,
                    post: result[0]
                });

            }
            else {
                return res.json({
                    success: false,
                    message: 'Error occured! ' + error
                });
            }
        });

};

// Get user info
exports.user_info = (req, res) => {
    var userId = req.params.id;
    var id;

    if (req.userData != undefined) id = req.userData.id;
    else id = -1;

    if (userId == undefined) {
        return res.json({
            success: false,
            message: 'Please insert user id!'
        });
    }

    db.query("SELECT u.id, "
        + "       u.username, "
        + "       u.first_name, "
        + "       u.last_name, "
        + "       u.avatar, "
        + "       (SELECT Count(p.id) "
        + "        FROM   posts p "
        + "        WHERE  p.user_id = ?)         AS posts, "
        + "       (SELECT Count(f.user_id) "
        + "        FROM   follows f "
        + "        WHERE  f.user_id = ?)         AS followers, "
        + "       (SELECT Count(f.user_id) "
        + "        FROM   follows f "
        + "        WHERE  f.follower_id = ?)     AS following, "
        + "       (SELECT Count(f.user_id) "
        + "        FROM   follows f "
        + "        WHERE  f.user_id = ? "
        + "               AND f.follower_id = ?) AS follow, "
        + "       (SELECT Json_arrayagg(Json_object( "
        + "                             'id', p.id, "
        + "                             'image', p.image, "
        + "                             'body', p.body, "
        + "                             'date',  Date_format(p.created_at,  '%Y-%m-%dT%TZ'), "
        + "                             'user', (SELECT  Json_object('id', u.id, 'username', u.username, "
        + "                                              'first_name', u.first_name, 'last_name' , u.last_name, 'avatar', u.avatar) "
        + "                                              FROM   users u "
        + "                                              WHERE  p.user_id = u.id), "
        + "                             'likes',  (SELECT Count(l.user_id) "
        + "                                              FROM   likes l "
        + "                                              WHERE l.post_id = p.id), "
        + "                             'comments',  (SELECT Count(c.user_id) "
        + "                                              FROM   comments c "
        + "                                              WHERE  c.post_id = p.id), "
        + "                             'liked',   (SELECT Count(l.user_id) "
        + "                                              FROM   likes l "
        + "                                              WHERE  l.post_id = p.id "
        + "                                              AND l.user_id = ?) )) "
        + "        FROM   posts p "
        + "        WHERE  p.user_id = ? "
        + "        ORDER  BY p.created_at DESC "
        + "        LIMIT  15)                    AS feeds "
        + "FROM   users u "
        + "WHERE  u.id = ?", [userId, userId, userId, userId, id, id, userId, userId], (error, result, field) => {
            if (!error) {
                // for (var i = 0; i < result.length; i++) {
                //     if (result[i].feeds == null) {
                //         result[i].feeds = [];
                //         continue;
                //     }
                //     result[i].feeds = JSON.parse(result[i].feeds);
                //     for (var j = 0; j < result[i].feeds.length; j++) {
                //         result[i].feeds[j].user = JSON.parse(result[i].feeds[j].user);
                //     }
                // }

                return res.json({
                    success: true,
                    user: result[0]
                });

            }
            else {
                return res.json({
                    success: false,
                    message: 'Error occured! ' + error
                });
            }
        });
};

// Get user posts
exports.user_posts = (req, res) => {
    var id = req.params.id;
    if (id != req.userData.id) {
        return res.json({
            success: false,
            message: 'Not authorized',
        });
    }

    db.query(
        "SELECT p.id, "
        + "         p.image, "
        + "         p.body, "
        + "         p.created_at AS date, "
        + "                (SELECT Json_object('id', u.id, 'username', u.username, 'first_name', u.first_name, 'last_name', "
        + "                        u.last_name, "
        + "                                'avatar', u.avatar) "
        + "                 FROM   users u "
        + "                 WHERE  p.user_id = u.id) AS user, "
        + "                (SELECT Count(l.user_id) "
        + "                 FROM   likes l "
        + "                 WHERE  l.post_id = p.id) AS likes, "
        + "                (SELECT Count(c.user_id) "
        + "                 FROM   comments c "
        + "                 WHERE  c.post_id = p.id) AS comments, "
        + "                (SELECT Count(l.user_id) "
        + "                 FROM   likes l "
        + "                 WHERE  l.post_id = p.id AND l.user_id = ? ) AS liked "
        + "         FROM   posts p "
        + "         WHERE   p.user_id = ? "
        + "         ORDER BY "
        + "             p.created_at DESC", [id, id], (error, result, fields) => {
            if (!error) {
                // for (var i = 0; i < result.length; i++) {
                //     result[i].user = JSON.parse(result[i].user);
                // }
                return res.json({
                    success: true,
                    feeds: result
                });

            }
            else {
                return res.json({
                    success: false,
                    message: 'Error occured! ' + error
                });
            }
        });
};

exports.like_post = (req, res) => {
    var id = req.body.id;
    if (id == undefined) {
        return res.json({
            success: false,
            message: 'Please insert post id!'
        });
    }

    Like.findOne({
        where: {
            post_id: id,
            user_id: req.userData.id,
        }
    }).then(like => {
        if (like) {
            like.destroy().then(deleted => {
                if (deleted) {
                    // Add to unlikes table (To not send a notification if liked again)
                    Unlike.findOrCreate({
                        where: {
                            post_id: like.post_id,
                            user_id: like.user_id,
                        },
                    });
                    return res.json({
                        success: true,
                        message: 'Post unliked'
                    });


                } else {
                    return res.json({
                        success: false,
                        message: 'Error'
                    });
                }
            }).catch(error => {
                return res.json({
                    success: false,
                    message: 'Error occured!'
                });
            });
        }
        else {
            Like.create({
                post_id: id,
                user_id: req.userData.id,
            }).then(like => {
                if (like) {
                    // check if exists in unlikes to determine 
                    // if we send a notification or no
                    Unlike.findOne({
                        where: {
                            post_id: id,
                            user_id: req.userData.id,
                        }
                    }).then(unlike => {
                        // post already liked before so we don't send a notification
                        if (unlike) {
                            return res.json({
                                success: true,
                                message: 'Post liked'
                            });
                        }
                        // We send a notification in this case
                        else {
                            Post.findOne({
                                where: { id: id }
                            }).then(post => {
                                if (post && post.user_id != req.userData.id) {
                                    // add notification
                                    Notification.create({
                                        sender_id: req.userData.id,
                                        receiver_id: post.user_id,
                                        post_id: post.id,
                                        type: 0,
                                        seen: 0,
                                    }).then(notification => {
                                        return res.json({
                                            success: true,
                                            message: 'Post liked'
                                        });
                                    }).catch(error => {
                                        console.log('add notification ' + error);
                                    });


                                    sendNotification(req.userData.id, post.user_id, 0);

                                } else {
                                    return res.json({
                                        success: true,
                                        message: 'Post liked'
                                    });
                                }
                            }).catch(error => {
                                console.log('find post catch ' + error);
                            });
                        }
                    });

                } else {
                    return res.json({
                        success: false,
                        message: 'Error liking post'
                    });
                }
            }).catch(error => {
                return res.json({
                    success: false,
                    message: 'Error liking post'
                });
            });

        }
    }).catch(error => {
        return res.json({
            success: false,
            message: 'Error occured!'
        });
    });

};

// Follow user
exports.follow_user = (req, res) => {
    var id = parseInt(req.body.id);

    console.log('id ' + id);
    if (id == undefined) {
        return res.json({
            success: false,
            message: 'Please insert user id!'
        });
    }

    if (id == req.userData.id) {
        return res.json({
            success: false,
            message: 'Please insert user id!'
        });
    }

    Follow.findOne({
        where: {
            user_id: id,
            follower_id: req.userData.id,
        }
    }).then(follow => {
        if (follow) {
            console.log('unfollowing...');
            follow.destroy().then(deleted => {
                if (deleted) {
                    // Add to unlikes table (To not send a notification if liked again)
                    Unfollow.findOrCreate({
                        where: {
                            user_id: follow.user_id,
                            follower_id: follow.follower_id,
                        },
                    });
                    console.log('User unfollowed');
                    return res.json({
                        success: true,
                        message: 'User unfollowed'
                    });

                } else {
                    return res.json({
                        success: false,
                        message: 'Error'
                    });
                }
            }).catch(error => {
                return res.json({
                    success: false,
                    message: 'Error occured!'
                });
            });
        }
        else {
            console.log('Following...');
            Follow.create({
                user_id: id,
                follower_id: req.userData.id,
            }).then(follow => {
                if (follow) {
                    // check if exists in unfollows to determine 
                    // if we send a notification or no
                    Unfollow.findOne({
                        where: {
                            user_id: id,
                            follower_id: req.userData.id,
                        }
                    }).then(unfollow => {
                        // user already followed before so we don't send a notification
                        if (unfollow) {
                            return res.json({
                                success: true,
                                message: 'User followed'
                            });
                        }
                        // We send a notification in this case
                        else {

                            // add notification
                            Notification.create({
                                sender_id: req.userData.id,
                                receiver_id: id,
                                //post_id: null,
                                type: 2,
                                seen: 0,
                            }).then(notification => {

                                sendNotification(req.userData.id, id, 2);

                                return res.json({
                                    success: true,
                                    message: 'User followed'
                                });

                            }).catch(error => {
                                console.log('add notification ' + error);
                            });

                        }
                    });

                } else {
                    return res.json({
                        success: false,
                        message: 'Error following user'
                    });
                }
            }).catch(error => {
                console.log('Follow user exception ' + error);
                return res.json({
                    success: false,
                    message: 'Error following user'
                });
            });

        }
    }).catch(error => {
        console.log('Follow user exception ' + error);
        return res.json({
            success: false,
            message: 'Error occured!'
        });
    });

};

// Get all feeds
exports.all_feeds = (req, res, next) => {
    var offset = parseInt(req.params.offset);
    var rows = 20;

    if (offset == undefined) {
        return res.json({
            success: false,
            message: 'missing params'
        });
    }

    db.query(
        "SELECT p.id, "
        + "         p.image, "
        + "         p.body, "
        + "         p.created_at AS date, "
        + "                (SELECT Json_object('id', u.id, 'username', u.username, 'first_name', u.first_name, 'last_name', "
        + "                        u.last_name, "
        + "                                'avatar', u.avatar) "
        + "                 FROM   users u "
        + "                 WHERE  p.user_id = u.id) AS user, "
        + "                (SELECT Count(l.user_id) "
        + "                 FROM   likes l "
        + "                 WHERE  l.post_id = p.id) AS likes, "
        + "                (SELECT Count(c.user_id) "
        + "                 FROM   comments c "
        + "                 WHERE  c.post_id = p.id) AS comments, "
        + "                (SELECT Count(l.user_id) "
        + "                 FROM   likes l "
        + "                 WHERE  l.post_id = p.id AND l.user_id = ? ) AS liked "
        + "         FROM   posts p "
        + "         ORDER BY "
        + "             p.created_at DESC "
        + "         LIMIT  ? offset ?", [req.userData.id, rows, (rows * offset)], (error, result, fields) => {
            if (!error) {
                // for (var i = 0; i < result.length; i++) {
                //     result[i].user = JSON.parse(result[i].user);
                // }
                return res.json({
                    success: true,
                    feeds: result
                });

            }
            else {
                return res.json({
                    success: false,
                    message: 'Error occured! ' + error
                });
            }
        });
};

// Get user feeds
exports.feeds = (req, res, next) => {
    var offset = parseInt(req.params.offset);
    var rows = 20;
    if (offset == undefined) {
        return res.json({
            success: false,
            message: 'missing params'
        });
    }

    db.query(
        "SELECT DISTINCT p.id, "
        + "       p.image, "
        + "       p.body, "
        + "       p.created_at                                AS date, "
        + "       (SELECT Json_object('id', u.id, 'username', u.username, 'first_name', u.first_name, 'last_name', "
        + "               u.last_name, "
        + "                       'avatar', u.avatar) "
        + "        FROM   users u "
        + "        WHERE  p.user_id = u.id)                   AS user, "
        + "       (SELECT Count(l.user_id) "
        + "        FROM   likes l "
        + "        WHERE  l.post_id = p.id)                   AS likes, "
        + "       (SELECT Count(c.user_id) "
        + "        FROM   comments c "
        + "        WHERE  c.post_id = p.id)                   AS comments, "
        + "       (SELECT Count(l.user_id) "
        + "        FROM   likes l "
        + "        WHERE  l.post_id = p.id "
        + "               AND l.user_id = ?)                 AS liked "
        + "FROM   follows f "
        + "LEFT JOIN posts p ON (p.user_id = f.user_id OR p.user_id = ?) "
        + "WHERE (f.follower_id = ? OR p.user_id = ?) "
        + "ORDER  BY p.created_at DESC "
        + "LIMIT  ? offset ?", [req.userData.id, req.userData.id, req.userData.id, req.userData.id, rows, (rows * offset)], (error, result, fields) => {
            if (!error) {
                // for (var i = 0; i < result.length; i++) {
                //     result[i].user = JSON.parse(result[i].user);
                // }
                return res.json({
                    success: true,
                    feeds: result
                });

            }
            else {
                console.log(error);
                return res.json({
                    success: false,
                    message: 'Error occured! ' + error
                });
            }
        });
};

exports.news = (req, res) => {
    News.findAll({
        attributes: ['id', 'title', 'body', [sequelize.fn('CONCAT', 'images/news/', sequelize.col('id'), '/', sequelize.col('image')), 'image'], ['created_at', 'date']]
    }).then(result => {
        return res.json({
            success: true,
            news: result
        });

    }).catch(error => {
        console.log(error);
        return res.json({
            success: false,
            message: 'Error occured!'
        });
    });
};

// Get post comments
exports.comments = (req, res) => {
    var id = req.params.id;
    if (id == undefined) {
        return res.json({
            success: false,
            message: 'Please insert post id!'
        });
    }

    db.query(
        "SELECT c.id, "
        + "       c.comment, "
        + "       c.created_at              AS date, "
        + "       (SELECT Json_object('id', u.id, 'username', u.username, 'first_name', u.first_name, 'last_name', "
        + "               u.last_name, "
        + "                       'avatar', u.avatar) "
        + "        FROM   users u "
        + "        WHERE  c.user_id = u.id) AS user "
        + "FROM   comments c "
        + "WHERE  c.post_id = ? "
        + "ORDER  BY c.created_at DESC", [id], (error, result, fields) => {
            if (!error) {
                // for (var i = 0; i < result.length; i++) {
                //     result[i].user = JSON.parse(result[i].user);
                // }
                return res.json({
                    success: true,
                    comments: result
                });

            }
            else {

                return res.json({
                    success: false,
                    message: 'Error occured!'
                });
            }
        });
};

// Add comment
exports.add_comment = (req, res) => {
    var { id, comment } = req.body;
    if (id == undefined) {
        return res.json({
            success: false,
            message: 'Invalid post id',
        });
    }

    Comment.create({
        post_id: id,
        user_id: req.userData.id,
        comment: comment,
    }).then(result => {
        if (result) {
            Post.findOne({
                where: { id: id },
                attributes: ['user_id']
            }).then(post => {
                if (req.userData.id != post.user_id) {

                    Notification.create({
                        sender_id: req.userData.id,
                        receiver_id: post.user_id,
                        post_id: id,
                        type: 1,
                        seen: 0,
                    }).then(notification => {

                        sendNotification(req.userData.id, post.user_id, 1);

                        return res.json({
                            success: true,
                            message: 'Comment added'
                        });
                    }).catch(error => {
                        console.log('add notification ' + error);
                    });


                } else {
                    return res.json({
                        success: true,
                        message: 'Comment added'
                    });
                }
            });


        } else {
            return res.json({
                success: false,
                message: 'Error adding Comment'
            });
        }
    }).catch(error => {
        return res.json({
            success: false,
            message: 'Error adding Comment'
        });
    });
};

// Delete comment
exports.delete_comment = (req, res) => {

    Comment.findOne({
        where: {
            id: req.params.id,
            user_id: req.userData.id,
        }
    }).then(comment => {
        if (comment) {
            comment.destroy().then(deleted => {
                if (deleted) {
                    console.log('Comment deleted');
                    return res.json({
                        success: true,
                        message: 'Comment deleted'
                    });


                } else {
                    console.log('Error');
                    return res.json({
                        success: false,
                        message: 'Error'
                    });
                }
            }).catch(error => {
                console.log('Error occured 0: ' + error);
                return res.json({
                    success: false,
                    message: 'Error occured!'
                });
            });
        } else {
            console.log('Comment not found');
            return res.json({
                success: false,
                message: 'Comment not found'
            });
        }
    }).catch(error => {
        console.log('Error occured: ' + error);
        return res.json({
            success: false,
            message: 'Error occured!'
        });
    });
};

exports.notifications = (req, res) => {
    db.query(
        "SELECT n.id, "
        + "       n.type, "
        + "       n.post_id, "
        + "       n.seen, "
        + "       n.created_at                  AS date, "
        + "       (SELECT Json_object('id', u.id, 'username', u.username, 'first_name', u.first_name, 'last_name', "
        + "               u.last_name, "
        + "                       'avatar', u.avatar) "
        + "        FROM   users u "
        + "        WHERE  n.sender_id = u.id)   AS sender, "
        + "       (SELECT Json_object('id', u.id, 'username', u.username, 'first_name', u.first_name, 'last_name', "
        + "               u.last_name, "
        + "                       'avatar', u.avatar) "
        + "        FROM   users u "
        + "        WHERE  n.receiver_id = u.id) AS receiver "
        + "FROM   notifications n "
        + "WHERE   n.receiver_id = ? "
        + "ORDER  BY n.created_at DESC", [req.userData.id], (error, result, fields) => {
            if (!error) {
                // for (var i = 0; i < result.length; i++) {
                //     result[i].sender = JSON.parse(result[i].sender);
                //     result[i].receiver = JSON.parse(result[i].receiver);
                // }
                return res.json({
                    success: true,
                    notifications: result
                });

            }
            else {

                return res.json({
                    success: false,
                    message: 'Error occured!'
                });
            }
        });
};

// User login
exports.login = (req, res) => {

    var email = req.body.email;
    var password = req.body.password;

    User.findOne({
        where: { email: email },
    }).then(user => {
        if (user) {
            bcrypt.compare(password, user.password, (err, res1) => {
                // res == true
                console.log('res1 ' + res1);
                if (res1) {
                    const token = jwt.sign(
                        {
                            id: user.id,
                            email: user.email
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "90d"
                        }
                    );
                    return res.json({
                        success: true,
                        //TODO user information
                        user: {
                            id: user.id,
                            username: user.username,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            email: user.email,
                            phone: user.phone,
                            avatar: user.avatar,
                        },
                        token: token,

                    });
                } else {
                    return res.json({
                        success: false,
                        message: 'Incorrect password'
                    });
                }

            });
        } else {
            console.log('not found user ');
            return res.json({
                success: false,
                message: 'Email is not registered'
            });
        }
    }).catch(err => {
        console.log('error ' + err);
        return res.json({
            success: false,
            message: 'Authorization failed'
        });
    });
};

// Change password
exports.change_password = (req, res) => {
    var { old_password, password, confirm_password } = req.body;

    if (password != confirm_password) {
        return res.json({
            success: false,
            message: 'Passwords must be the same'
        });
    }
    User.findOne({
        where: { id: req.userData.id }
    }).then(user => {
        if (user) {
            bcrypt.compare(old_password, user.password, (err, res1) => {
                if (res1) {
                    user.update({
                        password: bcrypt.hashSync(password, 12)
                    }).then(updatedUser => {
                        if (updatedUser) {
                            return res.json({
                                success: true,
                                message: 'Password changed!'
                            });
                        } else {
                            return res.json({
                                success: false,
                                message: 'Error occured!'
                            });
                        }
                    }).catch(error => {
                        return res.json({
                            success: false,
                            message: 'Error occured!'
                        });
                    });

                } else {
                    return res.json({
                        success: false,
                        message: 'Incorrect password'
                    });

                }
            });
        }
    }).catch(error1 => {
        return res.json({
            success: false,
            message: 'Error occured!'
        });
    });
};

// Sign up
// #1 - Upload avatar
exports.upload_avatar = async (req, res, next) => {
    const { filename: image } = req.file
    const avatar = req.file.filename;

    //Resize image
    await sharp(req.file.path)
        .resize(128)
        .jpeg({ quality: 80 })
        .toFile(
            path.resolve(req.file.destination, '128x128_' + image)
        );

    await sharp(req.file.path)
        .resize(256)
        .jpeg({ quality: 80 })
        .toFile(
            path.resolve(req.file.destination, '256x256_' + image)
        );
    fs.unlinkSync(req.file.path);

    return res.json({
        success: true,
        message: avatar
    });
};

// #2 - Signu up
exports.signup = (req, res, next) => {
    var { username, email, password, confirm_password, phone, first_name, last_name, avatar } = req.body;
    if (password != confirm_password) {
        return res.json({
            success: false,
            message: 'Passwords must be the same!'
        });
    }

    User.findOne({
        where: {
            [Op.or]: [{ username: { [Op.like]: username } }, { email: email }, { phone: phone }]
        },
        // ['email', 'user_email'] -> replace email by user_email
        //attributes: ['id', 'email', 'password']
    }).then(user => {
        if (user) {
            if (username.toLowerCase() == user.username.toLowerCase()) {
                return res.json({
                    success: false,
                    message: 'Username taken!'
                });
            }
            else if (email == user.email) {
                return res.json({
                    success: false,
                    message: 'Email already regitered!'
                });
            } else {
                return res.json({
                    success: false,
                    message: 'Phone number already regitered!'
                });
            }
        } else {
            User.create(
                {

                    username: username,
                    email: email,
                    country_code: '+91',
                    phone: phone,
                    first_name: first_name,
                    last_name: last_name,
                    password: bcrypt.hashSync(password, 12),
                    gcm_token: '',
                    avatar: avatar,
                    registration_date: Date.now(),

                }
            ).then((user) => {

                var oldPath = './public/images/users/tmp/128x128_' + avatar;
                if (fs.existsSync(oldPath)) {
                    var newPath = './public/images/users/' + user[0].id + '/';
                    if (!fs.existsSync(newPath)) {
                        fs.mkdirSync(newPath);
                    }


                    fs.rename(oldPath, newPath + '128x128_' + avatar, function (err) {
                        if (err) throw err
                        console.log('Successfully renamed - AKA moved!')
                    });

                    oldPath = './public/images/users/tmp/256x256_' + avatar;
                    fs.rename(oldPath, newPath + '256x256_' + avatar, function (err) {
                        if (err) throw err
                        console.log('Successfully renamed - AKA moved!')
                    });
                }

                return res.json({
                    success: true,
                    message: 'Account registered! You can now login from same email'
                });

            });
        }
    }).catch(error => {
        console.log('signup_find' + error);
        return res.json({
            success: false,
            message: 'Error occured!'
        });
    });

};

// Update profile info
// #1 - Update avatar
exports.change_avatar = async (req, res, next) => {
    const { filename: image } = req.file
    const avatar = req.file.filename;

    //DELETE old files
    fs.readdir(req.file.destination, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            if (path.basename(file) != req.file.filename) fs.unlink(path.join(req.file.destination, file), err => {
                if (err) throw err;
            });
        }
    });

    //Resize image
    await sharp(req.file.path)
        .resize(128)
        .jpeg({ quality: 80 })
        .toFile(
            path.resolve(req.file.destination, '128x128_' + image)
        );

    await sharp(req.file.path)
        .resize(256)
        .jpeg({ quality: 80 })
        .toFile(
            path.resolve(req.file.destination, '256x256_' + image)
        );
    fs.unlinkSync(req.file.path);

    return res.json({
        success: true,
        message: avatar
    });
};

// #2 - Update info
exports.update_profile = (req, res) => {
    var { phone, username, first_name, last_name, avatar } = req.body;
    var exists = false;

    if (username == undefined) {
        return res.json({
            success: false,
            message: 'Insert a valid username'
        });
    }

    if (first_name == undefined) {
        return res.json({
            success: false,
            message: 'Insert a valid first name'
        });
    }

    if (last_name == undefined) {
        return res.json({
            success: false,
            message: 'Insert a valid last name'
        });
    }

    if (phone == undefined) {
        return res.json({
            success: false,
            message: 'Insert a valid phone number'
        });
    }

    // Check if image exists in tmp
    // if (avatar == undefined) avatar = '';
    var oldPath = './public/images/users/tmp/' + avatar;
    if (fs.existsSync(oldPath)) exists = true;

    // Check if username is taken
    User.findOne({
        where: {
            username: { [Op.like]: username },
        },
    }).then(user => {
        if (user != null && user.id != req.userData.id) {
            return res.json({
                success: false,
                message: 'Username taken!'
            });
        } else {
            User.update(
                {
                    phone: phone,
                    username: username,
                    first_name: first_name,
                    last_name: last_name,
                    avatar: avatar,
                },
                {
                    where: { id: req.userData.id }
                }).then(updated => {
                    if (updated) {
                        if (exists) {
                            var newPath = './public/images/users/' + req.userData.id + '/';
                            if (!fs.existsSync(newPath)) {
                                fs.mkdirSync(newPath);
                            }

                            fs.rename(oldPath, newPath + avatar, function (err) {
                                if (err) throw err
                                console.log('Successfully renamed - AKA moved!')
                            });
                        }

                        return res.json({
                            success: true,
                            user: {
                                username: username,
                                first_name: first_name,
                                last_name: last_name,
                                phone: phone,
                                avatar: avatar,
                            }
                        });
                    } else {
                        return res.json({
                            success: false,
                            message: 'Error updating user info'
                        });
                    }
                }).catch(error => {
                    console.log('Exception updating user info ' + error);
                    return res.json({
                        success: false,
                        message: 'Error occured!'
                    });
                });
        }
    }).catch(error => {
        console.log('Error ' + error);
        return res.json({
            success: false,
            message: 'Error occured!'
        });
    });

};

// Get user messages
exports.user_messages = (req, res) => {
    db.query(
        "SELECT m.*, "
        + "       (SELECT Json_object('id', u.id, 'username', u.username, 'first_name', u.first_name, 'last_name', "
        + "               u.last_name, "
        + "                       'avatar', u.avatar) "
        + "        FROM   users u "
        + "        WHERE  m.sender_id = u.id)   AS sender, "
        + "       (SELECT Json_object('id', u.id, 'username', u.username, 'first_name', u.first_name, 'last_name', "
        + "               u.last_name, "
        + "                       'avatar', u.avatar) "
        + "        FROM   users u "
        + "        WHERE  m.receiver_id = u.id) AS receiver "
        + "FROM   messages m "
        + "WHERE  m.id IN (SELECT Max(m.id) AS max_id "
        + "                FROM   messages m "
        + "                WHERE  m.sender_id = ? "
        + "                        OR m.receiver_id = ? "
        + "                GROUP  BY Least(m.receiver_id, m.sender_id), "
        + "                          Greatest(m.receiver_id, m.sender_id)) "
        + "ORDER  BY m.created_at DESC", [req.userData.id, req.userData.id], (error, result, fields) => {
            if (!error) {
                // for (var i = 0; i < result.length; i++) {
                //     result[i].sender = JSON.parse(result[i].sender);
                //     result[i].receiver = JSON.parse(result[i].receiver);
                // }
                return res.json({
                    success: true,
                    messages: result
                });

            }
            else {
                console.log('messages error ' + error);
                return res.json({
                    success: false,
                    message: 'Error occured!'
                });
            }
        });
};

// Get user messages details
exports.user_messages_details = (req, res) => {
    var id = parseInt(req.params.id);
    var offset = parseInt(req.params.offset);
    var rows = 20;
    if (id == undefined || offset == undefined) {
        return res.json({
            success: false,
            message: 'missing params'
        });
    }

    if (id == req.userData.id) {
        return res.json({
            success: false,
            message: 'Please insert user id!'
        });
    }

    db.query(
        "SELECT m.* "
        + "FROM   messages m "
        + "WHERE  ( m.sender_id = ? "
        + "          OR m.receiver_id = ? ) "
        + "       AND ( m.sender_id = ? "
        + "              OR m.receiver_id = ? ) "
        + "ORDER  BY m.created_at DESC "
        + "LIMIT  ? offset ?", [id, id, req.userData.id, req.userData.id, rows, (offset * rows)], (error, result, fields) => {
            if (!error) {

                return res.json({
                    success: true,
                    messages: result
                });

            }
            else {
                console.log('user_messages_details: ' + error);
                return res.json({
                    success: false,
                    message: 'Error occured! ' + error
                });
            }
        });
};

// Search posts
exports.search_posts = (req, res) => {
    var id;
    if (req.userData != undefined) id = req.userData.id;
    else id = -1;

    if (req.query.query == undefined) {
        return res.json({
            success: false,
            message: 'Empty query'
        });
    }

    db.query(
        "SELECT DISTINCT p.id, "
        + "         p.image, "
        + "         p.body, "
        + "         p.created_at AS date, "
        + "              (SELECT Json_object('id', u.id, 'username', u.username, 'first_name', u.first_name, 'last_name', "
        + "                      u.last_name, "
        + "                              'avatar', u.avatar) "
        + "                      FROM   users u "
        + "                      WHERE  p.user_id = u.id) AS user, "
        + "              (SELECT Count(l.user_id) "
        + "                      FROM   likes l "
        + "                      WHERE  l.post_id = p.id)                   AS likes, "
        + "              (SELECT Count(c.user_id) "
        + "                      FROM   comments c "
        + "                      WHERE  c.post_id = p.id)                   AS comments, "
        + "              (SELECT Count(l.user_id) "
        + "                      FROM   likes l "
        + "                      WHERE  l.post_id = p.id "
        + "                      AND l.user_id = ?)                 AS liked "
        + "         FROM   posts p "
        + "         LEFT JOIN users u ON u.id = p.id "
        + "         WHERE p.body LIKE CONCAT('%', ?,  '%') "
        + "         ORDER BY "
        + "             p.created_at DESC LIMIT 20", [id, req.query.query], (error, result, fields) => {
            if (!error) {
                // for (var i = 0; i < result.length; i++) {
                //     result[i].user = JSON.parse(result[i].user);
                // }
                return res.json({
                    success: true,
                    feeds: result
                });
            }
            else {
                console.log('search_feeds ' + error);
                return res.json({
                    success: false,
                    message: 'Error occured! ' + error
                });
            }
        });
};

// Search posts auto complete
exports.search = (req, res) => {
    if (req.query.query == undefined) {
        return res.json({
            success: false,
            message: 'Empty query'
        });
    }

    db.query(
        "SELECT p.id, "
        + "         p.body "
        + "         FROM   posts p "
        + "         WHERE p.body LIKE CONCAT('%', ?,  '%') "
        + "         ORDER BY "
        + "             p.created_at DESC LIMIT 20", [req.query.query], (error, result, fields) => {
            if (!error) {
                return res.json({
                    success: true,
                    feeds: result
                });
            }
            else {
                console.log('all_feeds ' + error);
                return res.json({
                    success: false,
                    message: 'Error occured! ' + error
                });
            }
        });
};

// Update gcm_token
exports.update_gcm_token = (req, res, next) => {
    var token = req.body.token.replace('%3A', ':');
    verifyFCMToken(token)
        .then(result => {
            // YOUR TOKEN IS VALID
            User.update(
                { gcm_token: token },
                { where: { id: req.userData.id } }
            ).then(updated => {
                if (updated) {
                    return res.json({
                        success: true,
                        message: 'Updated!'
                    });
                } else {
                    return res.json({
                        success: false,
                        message: 'Error occured!'
                    });
                }
            }).catch(error => {
                return res.json({
                    success: false,
                    message: 'Error occured!'
                });
            });
        })
        .catch(error => {
            // YOUR TOKEN IS INVALID
            return res.json({
                success: false,
                message: 'Error occured!'
            });
        })
};

// Reset password step 1
exports.reset_password_step_1 = (req, res, next) => {
    var email = req.body.email;
    var code;
    User.findOne({
        where: { email: email }
    }).then(user => {
        if (user) {
            console.log('user found');
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email
                },
                process.env.JWT_KEY_FORGOT1,
                {
                    expiresIn: "10m"
                }
            );
            code = genCode(6);
            ResetPassword.create({
                user_id: user.id,
                code: code,
            }).then(result => {
                if (result) {
                    var subject = 'Reset password';
                    var text = 'Password reset code: \n ' + code;

                    sendMail(email, subject, text, function (err, data) {
                        if (err) {
                            console.log('ERROR: ', err);
                            return res.json({
                                success: false,
                                message: 'Internal Error'
                            });
                        }
                        console.log('Email sent!!!');
                        return res.json({
                            success: true,
                            message: token
                        });
                    });
                }
            }).catch(error => {
                console.log('failed ' + error);
                return res.json({
                    success: false,
                    message: 'Error occured!'
                });
            });
        } else {
            return res.json({
                success: false,
                message: 'Email does not exist'
            });
        }
    }).catch(error => {
        console.log('error occured ' + error);
        return res.json({
            success: false,
            message: 'Error occured!'
        });
    });
};

// Reset password step 2
exports.reset_password_step_2 = (req, res, next) => {
    var { token, code } = req.body;
    jwt.verify(token, process.env.JWT_KEY_FORGOT1, (err, decoded) => {
        if (err) {
            if (err.name == 'TokenExpiredError') {
                return res.json({
                    success: false,
                    message: 'Session expired, resend code'
                });
            }
            return res.json({
                success: false,
                message: 'Auth failed' + err.name
            });
        }
        ResetPassword.findOne({
            where: { user_id: decoded.id },
            order: [['created_at', 'DESC']],
        }).then(result => {
            if (result) {
                console.log(result.code);
                if (code == result.code) {
                    console.log('code is the same');
                    const token = jwt.sign(
                        {
                            id: decoded.id,
                            email: decoded.email
                        },
                        process.env.JWT_KEY_FORGOT2,
                        {
                            expiresIn: "10m"
                        }
                    );
                    return res.json({
                        success: true,
                        message: token
                    });
                }
                else {
                    console.log('code error');
                    return res.json({
                        success: false,
                        message: 'Incorrect verification code'
                    });
                }

            }
        }).catch(error => {
            return res.json({
                success: false,
                message: 'Error occured!'
            });
        });

    });
};

// Reset password step 3
exports.reset_password = (req, res, next) => {
    var { token, password, confirm_password } = req.body;
    console.log(token);
    console.log(password);
    console.log(confirm_password);
    jwt.verify(token, process.env.JWT_KEY_FORGOT2, (err, decoded) => {
        if (err) {
            if (err.name == 'TokenExpiredError') {
                return res.json({
                    success: false,
                    message: 'Session expired, resend code'
                });
            }
            return res.json({
                success: false,
                message: 'Auth failed'
            });
        }
        if (password != confirm_password) {
            return res.json({
                success: false,
                message: 'Passwords must be the same'
            });
        }
        User.findOne({
            where: { id: decoded.id }
        }).then(user => {
            if (user) {
                user.update({
                    password: bcrypt.hashSync(password, 12)
                }).then(updatedUser => {
                    if (updatedUser) {
                        ResetPassword.destroy({
                            where: { user_id: decoded.id }
                        });
                        return res.json({
                            success: true,
                            message: 'Password updated!'
                        });
                    } else {
                        return res.json({
                            success: false,
                            message: 'Error occured!'
                        });
                    }
                }).catch(error => {
                    return res.json({
                        success: false,
                        message: 'Error occured!'
                    });
                });
            }
        }).catch(error1 => {
            return res.json({
                success: false,
                message: 'Error occured!'
            });
        });

    });
};

function verifyFCMToken(fcmToken) {
    return admin.messaging().send({
        token: fcmToken
    }, true)
}

function sendNotification(sender, receiver, type) {
    var message;
    var title;

    if (type == 0) {
        title = 'New like';
        message = ' liked your post';

    }
    else if (type == 1) {
        title = 'New comment';
        message = ' commented on your post';
    }
    else {
        title = 'New follow';
        message = ' started following you';
    }

    db.query(
        "SELECT receiver.gcm_token, "
        + "       sender.username AS sender "
        + "FROM   users receiver "
        + "       LEFT JOIN users AS sender "
        + "              ON sender.id = ? "
        + "WHERE  receiver.id = ?", [sender, receiver], (error, result, fields) => {
            if (!error) {
                var registrationTokens = [
                    result[0].gcm_token
                ];

                var payload = {
                    notification: {
                        title: title,
                        body: result[0].sender + message,
                    }
                };

                admin.messaging().sendToDevice(registrationTokens, payload)
                    .then((response) => {
                        console.log('Notification sent!');

                    })
                    .catch((error) => {
                        console.log('Notification failed! ' + error);

                    });
            }
        });
}

function genCode(length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function between(min, max) {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}