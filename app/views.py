from flask import render_template
from flask import Response, request
from app import app
from bunch import bunchify
from binner.collection_bin import BinCollection
from binner.collection_item import ItemCollection
from binner.algo_multi import AlgoMulti
from binner.algo_smallest import AlgoSmallest
from binner.algo_single import AlgoSingle
from binner.exception import DistributionException
import json

# ROUTING/VIEW FUNCTIONS
@app.route('/')
@app.route('/index')
def index():
    # Renders index.html.
    return render_template('blank.html')

@app.route('/about')
def about():
    return render_template('blank.html')

@app.route('/results')
def results():
    return render_template('blank.html')

@app.route('/estimate', methods=['POST'])
def estimate():
	data = request.json
	args = bunchify(data['args'])
	item_collection = ItemCollection( data['items'] )
	bin_collection =  BinCollection( data['bins']  )
	if args.algorithm == "multi":
		target_algo = AlgoMulti( args, bin_collection, item_collection )
	elif args.algorithm == "smallest":
		target_algo = AlgoSmallest( args, bin_collection, item_collection )
	elif args.algorithm == "single":
		target_algo= AlgoSingle( args, bin_collection, item_collection )

 	try:
		result = target_algo.run().show()

		xhr_storage_path = "%s/static/data/%s.json"%(app.root_path, result['run']['id'])
		json_result = json.dumps( result )
		with open( xhr_storage_path, "w+" ) as xhr_storage_file:
		    xhr_storage_file.write( json_result )

		return Response( json_result,  status=200 )
	## handle binner exceptions
	except DistributionException, ex:
		message = "Distribution Error: %s"%(str(ex))
		return Response( json.dumps( {"message": message } ), status=500 )
	except Exception, ex:
		binner_response = repr( ex  )
		message = "Error occured in Binner: %s"%(binner_response)
		return Response( json.dumps( { "message": message } ), status=500 )
	
		


@app.route('/author')
def author():
    # Renders author.html.
    return render_template('author.html')
