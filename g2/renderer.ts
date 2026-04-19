import {
  CreateStartUpPageContainer,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import { state, getBridge } from './state'

function getCurrentTime(): string {
  const now = new Date()
  return now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export async function showTime(): Promise<void> {
  const b = getBridge()
  if (!b) return

  const time = getCurrentTime()

  if (!state.startupRendered) {
    await b.createStartUpPageContainer(new CreateStartUpPageContainer({
      containerTotalNum: 1,
      textObject: [
        new TextContainerProperty({
          containerID: 1,
          containerName: 'time',
          content: time,
          xPosition: 0,
          yPosition: 0,
          width: 576,
          height: 288,
        }),
      ],
    }))
    state.startupRendered = true
  } else {
    await b.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: 1,
        containerName: 'time',
        content: time,
      }),
    )
  }
}