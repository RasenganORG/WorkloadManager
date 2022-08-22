import Board from 'react-trello'
import { Layout, Button, message, Popconfirm } from 'antd'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from "react-redux"
import { useDispatch } from 'react-redux';
import { deleteTask } from '../../../../../../../features/projects/projectsSlice';
import { updateTask } from '../../../../../../../features/projects/projectsSlice';
import { useEffect } from 'react';
import { getProjectItem } from '../../../../../../../features/projects/projectsSlice';
import { resetCurrentProjectSuccess } from '../../../../../../../features/projects/projectsSlice';

export default function Tasks() {
  const params = useParams()
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const { project, isSuccess } = useSelector(
    (state) => state.projects.currentProject
  )

  useEffect(() => {
    if (isSuccess) {
      dispatch(getProjectItem(params.projectId))
      dispatch(resetCurrentProjectSuccess())
    }
  }, [isSuccess])

  //get project tasks and filter them by the queue
  const backlogTasks = project.tasks.filter((task) => task.queue == 'Backlog')
  const sprintTasks = project.tasks.filter((task) => task.queue == 'Sprint')
  const inProgressTasks = project.tasks.filter((task) => task.queue == 'In Progress')
  const completedTasks = project.tasks.filter((task) => task.queue == 'Completed')
  const blockedTasks = project.tasks.filter((task) => task.queue == 'Blocked')

  const taskGenerator = (task) => {
    return {
      id: task.id.toString(),
      title: task.title,
      description: task.description,
      label: task.asignee,
      metadata: {
        taskInfo: 'asdsa'
      }
    }
  }

  const handleCardDelete = (taskId) => {
    let taskToDelete = project.tasks.find(task => task.id == taskId)
    dispatch(deleteTask({ data: taskToDelete, projectId: params.projectId, taskId: params.taskId }))

  }

  const handleLaneChange = (fromLaneId, toLaneId, cardId) => {
    const currentTask = project.tasks.find(task => task.id == cardId)
    const newTask = {
      ...currentTask,
      queue: toLaneId,
    }
    dispatch(updateTask({ data: { newTask, currentTask }, projectId: params.projectId, taskId: cardId }))

  }


  const data = {
    lanes: [
      {
        id: 'Backlog',
        title: 'Backlog',
        label: `${backlogTasks.length}`,
        cards: backlogTasks.map((task) => taskGenerator(task))
      },
      {
        id: 'Sprint',
        title: 'Sprint',
        label: `${sprintTasks.length}`,
        cards: sprintTasks.map((task) => taskGenerator(task))
      },
      {
        id: 'Blocked',
        title: 'Blocked ',
        label: `${blockedTasks.length}`,
        cards: blockedTasks.map((task) => taskGenerator(task))
      },
      {
        id: 'In Progress',
        title: `In Progress`,
        label: `${inProgressTasks.length}`,
        cards: inProgressTasks.map((task) => taskGenerator(task))
      },
      {
        id: 'Completed',
        title: 'Completed',
        label: `${completedTasks.length}`,
        cards: completedTasks.map((task) => taskGenerator(task))
      }
    ]
  }


  return (
    <Layout>
      <Board
        data={data}
        style={{ background: "transparent" }}
        draggable={true}
        onCardClick={(cardId, metadata, laneId) => navigate(`${cardId}`)}
        onCardDelete={(cardId) => handleCardDelete(cardId)}
        onCardMoveAcrossLanes={(fromLaneId, toLaneId, cardId) => handleLaneChange(fromLaneId, toLaneId, cardId)}
        hideCardDeleteIcon={true}
      />
      <Outlet />
    </Layout>

  )
}
