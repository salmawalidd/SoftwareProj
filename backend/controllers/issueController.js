import supabase from "../config/db.js";

export const createIssue = async (req, res) => {
  try {
    const {
      category,
      description,
      location,
      photo,
    } = req.body;

    if (!category || !description || !location) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const { data, error } = await supabase
      .from("issues")
      .insert([
        {
          title: category,
          category,
          description,
          location,
          photo,
          status: "pending",
          assign_worker: null,
          user_id: req.user.id,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({
        message: error.message,
      });
    }

    res.status(201).json({
      message: "Issue submitted successfully",
      issue: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getIssues = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        message: "Access denied. Managers only.",
      });
    }

    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return res.status(500).json({
        message: error.message,
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyIssues = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return res.status(500).json({
        message: error.message,
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const assignIssue = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        message: "Access denied. Managers only.",
      });
    }

    const { workerName } = req.body;

    if (!workerName) {
      return res.status(400).json({
        message: "Worker name is required",
      });
    }

    const { data, error } = await supabase
      .from("issues")
      .update({
        assign_worker: workerName,
        status: "in progress",
      })
      .eq("id", req.params.id)
      .select();

    if (error) {
      return res.status(500).json({
        message: error.message,
      });
    }

    res.status(200).json({
      message: "Issue assigned successfully",
      issue: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    if (
      req.user.role !== "manager" &&
      req.user.role !== "worker"
    ) {
      return res.status(403).json({
        message: "Access denied. Managers or workers only.",
      });
    }

    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "in progress",
      "resolved",
      "closed",
    ];

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Use pending, in progress, resolved, or closed.",
      });
    }

    const { data: currentIssue, error: fetchError } = await supabase
      .from("issues")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !currentIssue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const currentStatus = currentIssue.status;

    const validTransitions = {
      pending: ["in progress"],
      "in progress": ["resolved"],
      resolved: ["closed"],
      closed: [],
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        message: `Invalid status change from ${currentStatus} to ${status}`,
      });
    }

    if (status === "closed" && req.user.role !== "manager") {
      return res.status(403).json({
        message: "Only managers can close resolved issues.",
      });
    }

    const { data, error } = await supabase
      .from("issues")
      .update({
        status,
      })
      .eq("id", req.params.id)
      .select();

    if (error) {
      return res.status(500).json({
        message: error.message,
      });
    }

    res.status(200).json({
      message: "Issue status updated successfully",
      issue: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const closeIssue = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        message: "Access denied. Managers only.",
      });
    }

    const { data: currentIssue, error: fetchError } = await supabase
      .from("issues")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !currentIssue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    if (currentIssue.status !== "resolved") {
      return res.status(400).json({
        message: "Only resolved issues can be closed.",
      });
    }

    const { data, error } = await supabase
      .from("issues")
      .update({
        status: "closed",
      })
      .eq("id", req.params.id)
      .select();

    if (error) {
      return res.status(500).json({
        message: error.message,
      });
    }

    res.status(200).json({
      message: "Issue closed successfully",
      issue: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAssignedIssues = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({
        message: "Access denied. Workers only.",
      });
    }

    const { data: worker, error: workerError } = await supabase
      .from("users")
      .select("name")
      .eq("id", req.user.id)
      .single();

    if (workerError || !worker) {
      return res.status(404).json({
        message: "Worker not found",
      });
    }

    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("assign_worker", worker.name)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return res.status(500).json({
        message: error.message,
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const addIssueComment = async (req, res) => {
  try {
    if (
      req.user.role !== "worker" &&
      req.user.role !== "manager"
    ) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        message: "Comment is required",
      });
    }

    const { data: currentIssue, error: fetchError } = await supabase
      .from("issues")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !currentIssue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const existingComments = currentIssue.comments || "";

    const updatedComments = existingComments
      ? `${existingComments}\n${req.user.role}: ${comment}`
      : `${req.user.role}: ${comment}`;

    const { data, error } = await supabase
      .from("issues")
      .update({
        comments: updatedComments,
      })
      .eq("id", req.params.id)
      .select();

    if (error) {
      return res.status(500).json({
        message: error.message,
      });
    }

    res.status(200).json({
      message: "Comment added successfully",
      issue: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const uploadCompletionPhoto = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({
        message: "Access denied. Workers only.",
      });
    }

    const { photo } = req.body;

    if (!photo) {
      return res.status(400).json({
        message: "Photo URL is required",
      });
    }

    const { data, error } = await supabase
      .from("issues")
      .update({
        completion_photo: photo,
      })
      .eq("id", req.params.id)
      .select();

    if (error) {
      return res.status(500).json({
        message: error.message,
      });
    }

    res.status(200).json({
      message: "Completion photo uploaded successfully",
      issue: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteIssue = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        message: "Access denied. Managers only.",
      });
    }

    const { data, error } = await supabase
      .from("issues")
      .delete()
      .eq("id", req.params.id)
      .select();

    if (error) {
      return res.status(500).json({
        message: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    res.status(200).json({
      message: "Issue deleted successfully",
      issue: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};