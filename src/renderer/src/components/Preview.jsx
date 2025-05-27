import PropTypes from 'prop-types'

export default function Preview({ reaction }) {
  return (
    <div className="flex-1 bg-green-500 flex items-center justify-center min-h-screen">
      {reaction && <img src={reaction.img} alt={reaction.name} width={256} height={256} />}
    </div>
  )
}

Preview.propTypes = {
  reaction: PropTypes.shape({
    img: PropTypes.any,
    name: PropTypes.string
  })
}
