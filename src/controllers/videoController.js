import routes from "../routes";
import Video from "../models/Video";
import Comment from "../models/Comment";

// Home

export const home = async (req, res) => {
	try {
		const videos = await Video.find({}).sort({ _id: -1 });
		res.render("home", { pageTitle: "Home", videos });
	} catch (error) {
		console.log(error);
		res.render("home", { pageTitle: "Home", videos: [] });
	}
};

// Search

export const search = async (req, res) => {
	const {
		query: { term: searchingBy },
	} = req;
	let videos = [];
	try {
		videos = await Video.find({
			title: { $regex: searchingBy, $options: "i" },
		});
	} catch (error) {
		console.log(error);
	}
	res.render("search", { pageTitle: "Search", searchingBy, videos });
};

// Upload

export const getUpload = (req, res) => res.render("upload", { pageTitle: "Upload" });

export const postUpload = async (req, res) => {
	const {
		body: { title, description },
		file: { location },
	} = req;
	const newVideo = await Video.create({
		fileUrl: location,
		title,
		description,
		creator: req.user.id,
	});
	req.user.videos.push(newVideo.id);
	req.user.save();
	res.redirect(routes.videoDetail(newVideo.id));
};

// Video Detail

export const videoDetail = async (req, res) => {
	const {
		params: { id },
	} = req;
	try {
		const video = await Video.findById(id)
			.populate("creator")
			.populate("comments");
		res.render("videoDetail", { pageTitle: video.title, video });
	} catch (error) {
		res.redirect(routes.home);
	}
};

// Edit Video

export const getEditVideo = async (req, res) => {
	const {
		params: { id },
	} = req;
	try {
		const video = await Video.findById(id);
		if (video.creator !== req.user.id) {
			throw Error();
		} else {
			res.render("editVideo", { pageTitle: `Edit ${video.title}`, video });
		}
	} catch (error) {
		res.redirect(routes.home);
	}
};

export const postEditVideo = async (req, res) => {
	const {
		params: { id },
		body: { title, description },
	} = req;
	try {
		await Video.findOneAndUpdate({ _id: id }, { title, description });
		res.redirect(routes.videoDetail(id));
	} catch (error) {
		res.redirect(routes.home);
	}
};

// Delete Video

export const deleteVideo = async (req, res) => {
	const {
		params: { id },
	} = req;
	try {
		const video = await Video.findById(id);
		if (video.creator != req.user.id) {
			// 데이터 타입 주의
			throw Error();
		} else {
			await Video.findOneAndRemove({ _id: id });
		}
	} catch (error) {
		console.log(error);
	}
	res.redirect(routes.home);
};

//

export const postRegisterView = async (req, res) => {
	const {
		params: { id },
	} = req;
	try {
		const video = await Video.findById(id);
		video.views = video.views + 1;
		video.save();
		res.status(200);
	} catch (error) {
		res.statusCode(400);
	} finally {
		res.end();
	}
};

// Add comment

export const postAddComment = async (req, res) => {
	const {
		params: { id },
		body: { comment },
		user,
	} = req;
	try {
		const video = await Video.findById(id);
		const newComment = await Comment.create({
			text: comment,
			creator: user.id,
		});
		video.comments.push(newComment.id); // append 와 push 순서 반대
		video.save();
		res.send({ commentId: newComment.id });
	} catch (error) {
		res.status(400);
		res.end();
	}
};

// delete comment

export const postDeleteComment = async (req, res) => {
	console.log("delete commnet AAA");
	const {
		params: { id },
	} = req;
	console.log(id);
	try {
		const comment = await Comment.findById(id);
		if (comment.creator != req.user.id) {
			throw Error();
		} else {
			await Comment.findOneAndRemove({ _id: id });
		}
		console.log("delete comment");
	} catch (error) {
		res.status(400);
	} finally {
		res.end();
	}
};
