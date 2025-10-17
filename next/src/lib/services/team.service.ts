import teamRepository from "@/lib/database/repos/team.repo";
import userRepository from "@/lib/database/repos/user.repo";
import {
  ESECs,
  ServiceSignature,
  EUserRole,
  SDOut,
  SDIn,
} from "@/lib/types/index.types";
import { withSession } from "../database/db";

const get: ServiceSignature<SDIn.Team.Get, SDOut.Team.Get, false> = async (
  data
) => {
  const team = await teamRepository.findById(data._id);
  if (!team) {
    return {
      success: false,
      errorCode: ESECs.TEAM_NOT_FOUND,
      errorMessage: "Team not found.",
    };
  }

  return {
    success: true,
    data: {
      _id: team._id.toHexString(),
      name: team.name,
      description: team.description,
      members: team.members.map((_id) => _id.toHexString()),
      coverImageMediaKey: team.coverImageMediaKey,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    },
  };
};

const getAll: ServiceSignature<
  SDIn.Team.GetAll,
  SDOut.Team.GetAll,
  false
> = async () => {
  const teams = await teamRepository.findAll({});

  return {
    success: true,
    data: teams.map((team) => {
      return {
        _id: team._id.toHexString(),
        name: team.name,
        description: team.description,
        coverImageMediaKey: team.coverImageMediaKey,
      };
    }),
  };
};

const create: ServiceSignature<
  SDIn.Team.Create,
  SDOut.Team.Create,
  true
> = async (data, session) => {
  if (!session.userRoles.includes(EUserRole.ADMIN)) {
    return {
      success: false,
      errorCode: ESECs.FORBIDDEN,
      errorMessage: "Only admin can create a new team.",
    };
  }

  const existingTeam = await teamRepository.findOne({
    name: data.name,
  });

  if (existingTeam) {
    return {
      success: false,
      errorCode: ESECs.TEAM_NAME_TAKEN,
      errorMessage: "A team with this name already exists.",
    };
  }

  await teamRepository.insert({
    name: data.name,
    description: data.description,
  });

  return {
    success: true,
    data: {},
  };
};

const addMembers: ServiceSignature<
  SDIn.Team.AddMembers,
  SDOut.Team.AddMembers,
  true
> = async (data, session) => {
  if (!session.userRoles.includes(EUserRole.ADMIN)) {
    return {
      success: false,
      errorCode: ESECs.FORBIDDEN,
      errorMessage: "Only admin can add team members.",
    };
  }

  const team = await teamRepository.findById(data._id);
  if (!team) {
    return {
      success: false,
      errorCode: ESECs.TEAM_NOT_FOUND,
      errorMessage: "Team not found.",
    };
  }

  await withSession(async (dbSession) => {
    await teamRepository.updateById(
      data._id,
      {
        $addToSet: {
          members: {
            $each: data.memberIds,
          },
        },
      },
      dbSession
    );

    await userRepository.updateMany(
      {
        _id: {
          $in: data.memberIds,
        },
      },
      {
        $set: {
          teamId: data._id,
        },
      },
      dbSession
    );
  });

  return {
    success: true,
    data: {},
  };
};

const update: ServiceSignature<
  SDIn.Team.Update,
  SDOut.Team.Update,
  true
> = async (data, session) => {
  if (!session.userRoles.includes(EUserRole.ADMIN)) {
    return {
      success: false,
      errorCode: ESECs.FORBIDDEN,
      errorMessage: "Only admin can update team's details.",
    };
  }

  const team = await teamRepository.findById(data._id);
  if (!team) {
    return {
      success: false,
      errorCode: ESECs.TEAM_NOT_FOUND,
      errorMessage: "Team not found.",
    };
  }

  await teamRepository.updateById(data._id, {
    name: data.name,
    description: data.description,
    coverImageMediaKey: data.coverImageMediaKey,
  });

  return {
    success: true,
    data: {},
  };
};

const remove: ServiceSignature<
  SDIn.Team.Remove,
  SDOut.Team.Remove,
  true
> = async (data, session) => {
  if (!session.userRoles.includes(EUserRole.ADMIN)) {
    return {
      success: false,
      errorCode: ESECs.FORBIDDEN,
      errorMessage: "Only admin can update team's details.",
    };
  }

  const team = await teamRepository.findById(data._id);
  if (!team) {
    return {
      success: false,
      errorCode: ESECs.TEAM_NOT_FOUND,
      errorMessage: "Team not found.",
    };
  }

  await withSession(async (dbSession) => {
    await teamRepository.removeById(data._id, dbSession);
    await userRepository.updateMany(
      {
        _id: data._id,
      },
      {
        $set: {
          teamId: null,
        },
      },
      dbSession
    );
  });

  return {
    success: true,
    data: {},
  };
};

const teamServices = {
  get,
  getAll,
  create,
  update,
  addMembers,
  remove,
};

export default teamServices;
